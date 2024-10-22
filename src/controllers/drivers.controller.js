const DriversController = (sec, orderService) => {
    const router = require("express").Router();

    // They must be authenticated and a driver to access these routes
    const driverSecurity = [sec.authenticateJWT, sec.isDriver];

    router.get("/drivers/:driverId/orders/available", driverSecurity, async (req, res) => {
        const orders = await orderService.getOrdersByStatus("pending");
        res.json({ status: "success", data: { orders } });
    });

    // Allow the driver to claim an order
    router.get("/drivers/:driverId/orders/:orderId/accept", driverSecurity, async (req, res) => {

        // Get the order to inspect its status
        const order = await orderService.getOrderById(parseInt(req.params.orderId));
        if (order && order.status !== "pending") {
            return res.status(400).json({ status: "fail", message: "This order is not available to be claimed" });
        }

        const orders = await orderService.claimOrder(req.params.orderId, req.params.driverId);
        res.json({ status: "success", data: { orders } });
    });

    router.get("/drivers/:driverId/orders/history", driverSecurity, async (req, res) => {
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