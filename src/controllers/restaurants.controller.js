const RestaurantsController = (security, restaurantsService) => {

  const router = require("express").Router();

  // Enforce authentication for all routes in this controller
  router.use(security.authenticateJWT);

  router.get("/restaurants", async (req, res) => {
      const restaurants = await restaurantsService.getRestaurants();
      res.json({ status: "success", data: { restaurants } });
  });

  router.get("/restaurants/:id", async (req, res) => {
      const restaurant = await restaurantsService.getRestaurant(parseInt(req.params.id));
      if (restaurant) {
          res.json({ status: "success", data: { restaurant } });
      } else {
          res.status(404).json({ status: "fail", message: "Restaurant not found" } );
      }
  });

  return { router };
};

module.exports = RestaurantsController;