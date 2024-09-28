const DestinationsController = (security, destinationService) => {

    const router = require("express").Router();

    // Enforce authentication for all routes in this controller
    router.use(security.authenticateJWT);

    router.get("/destinations", async (req, res) => {
        const destinations = await destinationService.getDestinations();
        res.json({ status: "success", data: { destinations } });
    });

    router.get("/destinations/:id", async (req, res) => {
        const destination = await destinationService.getDestination(parseInt(req.params.id));
        if (destination) {
            res.json({ status: "success", data: { destination } });
        } else {
            res.status(404).json({ status: "fail", data: { destination: "Not found" } });
        }
    });

    return { router };
};

module.exports = DestinationsController;