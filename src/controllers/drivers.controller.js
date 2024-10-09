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

  router.get("/drivers/:driverId/orders/history", async (req, res) => {
      // Ensure that the driver id matches the user's id
      if (parseInt(req.params.driverId) !== req.user.id) {
          return res.status(403).json({ status: "fail", message: "You are not authorized to view this driver's orders" });
      }

      const orders = await orderService.getOrdersByDriverId(parseInt(req.params.driverId));
      res.json({ status: "success", data: { orders } });
  });

  return { router };
};

module.exports = DriversController;