const RestaurantsController = (sec, restaurantsService) => {

  const router = require("express").Router();
  
  router.get("/restaurants", sec.authenticateJWT, async (req, res) => {
      const restaurants = await restaurantsService.getRestaurants();
      res.json({ status: "success", data: { restaurants } });
  });

  router.get("/restaurants/:id", sec.authenticateJWT, async (req, res) => {
      const restaurant = await restaurantsService.getRestaurantById(parseInt(req.params.id));
      if (restaurant) {
          res.json({ status: "success", data: { restaurant } });
      } else {
          res.status(404).json({ status: "fail", message: "Restaurant not found" } );
      }
  });

  return { router };
};

module.exports = RestaurantsController;