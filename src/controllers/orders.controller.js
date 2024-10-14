const OrdersController = (security, orderService) => {

  const router = require("express").Router();

  // Enforce authentication for all routes in this controller
  router.use(security.authenticateJWT);

  router.get("/orders", async (req, res) => {
      const orders = await orderService.getOrdersVisibleToUser(req.user.id);
      res.json({ status: "success", data: { orders } });
  });

  router.post("/orders", async (req, res) => {
      // Only customers can place orders
      if (req.user.role !== "customer") {
          return res.status(403).json({ status: "fail", message: "You are not authorized to place an order" });
      }
      // Validate the request body
      if (!req.body.restaurantId || !req.body.destinationId || !req.body.orderItems) {
          return res.status(400).json({ status: "fail", message: "Missing required fields: restaurantId, destinationId, and orderItems" });
      }

      // Ensure that the orderItems is an array
      if (!Array.isArray(req.body.orderItems) || req.body.orderItems.length === 0) {
          return res.status(400).json({ status: "fail", message: "orderItems must be a non-empty array" });
      }

      // Ensure that each order item has a foodId and quantity
      for (const orderItem of req.body.orderItems) {
          if (!orderItem.foodId || !orderItem.quantity) {
              return res.status(400).json({ status: "fail", message: "Each order item must have a foodId and quantity" });
          }
      }

      const order = await orderService.placeOrder(req.user.id, req.body.restaurantId, req.body.destinationId, req.body.orderItems);
      res.json({ status: "success", data: { order } });
  });

  router.put("/orders/:id", async (req, res) => {
      // First, get the order
      const order = await orderService.getOrderById(parseInt(req.params.id));
      if (order) {
          // Check to see if the user is authorized to update this order
          if (order.driverId !== req.user.id) {
              return res.status(403).json({ status: "fail", message: "You are not authorized to update this order" });
          }

          // The request body should contain a status
          if (!req.body.status) {
              return res.status(400).json({ status: "fail", message: "Missing required field: status" });
          }

          // Update the order
          const updatedOrder = await orderService.updateOrderStatus(parseInt(req.params.id), req.body.status);
          res.json({ status: "success", data: { order: updatedOrder } });
      } else {
          res.status(404).json({ status: "fail", message: "Order not found" } );
      }
  });

  router.get("/orders/:id", async (req, res) => {
      // First, get the order
      const order = await orderService.getOrderById(parseInt(req.params.id));
      if (order) {
          // Check to see if the user is authorized to view this order
          if (order.customerId !== req.user.id && order.driverId !== req.user.id) {
              return res.status(403).json({ status: "fail", message: "You are not authorized to view this order" });
          }

          res.json({ status: "success", data: { order } });
      } else {
          res.status(404).json({ status: "fail", message: "Order not found" } );
      }
  });

  return { router };
};

module.exports = OrdersController;