const DestinationsController = (sec, destinationService) => {

    const router = require("express").Router();

    router.get("/destinations", sec.authenticateJWT, async (req, res) => {
        const destinations = await destinationService.getDestinations();
        res.json({ status: "success", data: { destinations } });
    });

    router.post("/destinations", sec.authenticateJWT, sec.isAdmin, async (req, res) => {

        if(!req.body.name || !req.body.address || !req.body.phone || !req.body.notes) {
            return res.status(400).json({ status: "fail", message: "Missing required fields" });
        }

        const newDestination = await destinationService.createDestination(req.body);
        res.json({ status: "success", data: newDestination });
    });

    router.get("/destinations/:id", sec.authenticateJWT, async (req, res) => {
        const destination = await destinationService.getDestinationById(parseInt(req.params.id));
        if (destination) {
            res.json({ status: "success", data: { destination } });
        } else {
            res.status(404).json({ status: "fail", message: "Destination not found" } );
        }
    });

    return { router };
};

module.exports = DestinationsController;