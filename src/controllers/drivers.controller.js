const DriversController = (security, orderService) => {

  const router = require("express").Router();

  // Enforce authentication for all routes in this controller
  router.use(security.authenticateJWT);

  router.get("/drivers/:driverId/orders/available", async (req, res) => {
      // Ensure that the request is coming from a driver
      if (req.user.role !== "driver") {
          return res.status(403).json({ status: "fail", message: "You are not authorized to view available orders" });
      }

      const orders = await orderService.getOrdersByStatus("pending");
      res.json({ status: "success", data: { orders } });
  });

  // Allow the driver to claim an order
  router.get("/drivers/:driverId/orders/:orderId/accept", async (req, res) => {
    // Ensure that the request is coming from a driver
    if (req.user.role !== "driver") {
        return res.status(403).json({ status: "fail", message: "You are not authorized to accept this order" });
    }

    // Get the order to inspect its status
    const order = await orderService.getOrderById(parseInt(req.params.orderId));
    if(order.status !== "pending") {
        return res.status(400).json({ status: "fail", message: "This order is not available to be claimed" });
    }

    const orders = await orderService.claimOrder(req.params.orderId, req.params.driverId);
    res.json({ status: "success", data: { orders } });
  });

  router.get("/drivers/:driverId/orders/history", async (req, res) => {
      // Ensure that the driver id matches the user's id and that they are a driver
      if (req.user.role !== 'driver' || parseInt(req.params.driverId) !== req.user.id) {
          return res.status(403).json({ status: "fail", message: "You are not authorized to view this driver's orders" });
      }

      const orders = await orderService.getOrdersByDriverId(parseInt(req.params.driverId));
      res.json({ status: "success", data: { orders } });
  });

  return { router };
};

module.exports = DriversController;