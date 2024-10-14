// Import modules we need to use in the app
const express = require('express');
const cors = require('cors');
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();   // Create an instance of express called "app"
app.use(express.json()); // Enable body parsing for JSON
app.use(cors());         // lets us process requests from other URLs
app.use(morgan("dev"));  // set up morgan middleware to log out all requests

// Create a new Prisma client
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create instances of services and middleware
const OrderService = require("./services/order.service");
const orderService = new OrderService(prisma);

const DestinationService = require("./services/destination.service");
const destinationService = new DestinationService(prisma);

const RestaurantService = require("./services/restaurant.service");
const restaurantService = new RestaurantService(prisma);

const UserService = require("./services/user.service");
const userService = new UserService(prisma, bcrypt);

const TokenService = require("./services/token.service");
const tokenService = new TokenService(jwt, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);

const SecurityMiddleware = require("./middleware/security.middleware");
const securityMiddleware = SecurityMiddleware(tokenService);

// Create controller instances
const UsersController = require('./controllers/users.controller');
const usersController = UsersController(userService, tokenService);

const DestinationsController = require('./controllers/destinations.controller');
const destinationsController = DestinationsController(securityMiddleware, destinationService);

const RestaurantsController = require('./controllers/restaurants.controller');
const restaurantsController = RestaurantsController(securityMiddleware, restaurantService);

const OrdersController = require('./controllers/orders.controller');
const ordersController = OrdersController(securityMiddleware, orderService);

const DriversController = require('./controllers/drivers.controller');
const driversController = DriversController(securityMiddleware, orderService);

// Routes
app.use('/api', usersController.router);        // This MUST come before the other routes
app.use('/api', destinationsController.router);
app.use('/api', restaurantsController.router);
app.use('/api', ordersController.router);
app.use('/api', driversController.router);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server Error');
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).send("Resource not found");
});

module.exports = app;