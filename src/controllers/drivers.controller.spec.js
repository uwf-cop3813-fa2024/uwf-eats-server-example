// Created with assistance by Github Copilot
const request = require('supertest');
const express = require('express');
const DriversController = require('./drivers.controller');

describe('DriversController', () => {
  let app;
  let security;
  let orderService;

  beforeEach(() => {
    security = {
      authenticateJWT: jest.fn((req, res, next) => {
      req.user = { id: 1 }; // Create a user object in req.user
      next();
      }),

      isCustomer: jest.fn((req, res, next) => { next(); }),
      isDriver: jest.fn((req, res, next) => { next(); }),
    };

    orderService = {
      getOrdersByStatus: jest.fn(),
      getOrdersByDriverId: jest.fn(),
      getOrderById: jest.fn(),
    };
  });

  it('should return a list of available orders if requested by a driver', async () => {
    const mockOrders = [{ id: 1, status: 'pending' }, { id: 2, status: 'pending' }];
    orderService.getOrdersByStatus.mockResolvedValue(mockOrders);

    // Mock user role as driver
    security.authenticateJWT = jest.fn((req, res, next) => {
      req.user = { id: 1, role: 'driver' };
      next();
    });

    // Create an individual instance of the app for this test
    app = express();
    const { router } = DriversController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .get('/drivers/1/orders/available')

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { orders: mockOrders }
    });
    expect(orderService.getOrdersByStatus).toHaveBeenCalledWith('pending');
    expect(orderService.getOrdersByStatus).toHaveBeenCalledTimes(1);
  });

  it('should return 403 if the available route is not accessed by a driver', async () => {
    // Mock user role as something other than driver
    security.authenticateJWT = jest.fn((req, res, next) => {
      req.user = { id: 1, role: 'customer' };
      next();
    });

    // Mock isDriver to return a 403
    security.isDriver = jest.fn((req, res, next) => {
      res.status(403).json({ status: 'fail', message: 'You are not authorized to perform this action' });
    });
    
    // Create an individual instance of the app for this test
    app = express();
    const { router } = DriversController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .get('/drivers/1/orders/available')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'You are not authorized to perform this action'
    });
  });

  it('should allow a driver to accept an order if authorized', async () => {
    const mockOrder = { id: 1, driverId: 1 };
    orderService.claimOrder = jest.fn().mockResolvedValue(mockOrder);
    orderService.getOrderById = jest.fn().mockResolvedValue({ id: 1, status: 'pending' });

    // Mock user role as driver
    security.authenticateJWT = jest.fn((req, res, next) => {
      req.user = { id: 1, role: 'driver' };
      next();
    });

    // Mock isDriver to allow them through
    security.isDriver = jest.fn((req, res, next) => {next()});

    // Create an individual instance of the app for this test
    app = express();
    const { router } = DriversController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .get('/drivers/1/orders/1/accept')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { orders: mockOrder }
    });
    expect(orderService.claimOrder).toHaveBeenCalledWith('1', '1');
    expect(orderService.claimOrder).toHaveBeenCalledTimes(1);
  });

  it('should return 403 if a non-driver tries to accept an order', async () => {
    // Mock user role as something other than driver
    security.authenticateJWT = jest.fn((req, res, next) => {
      req.user = { id: 1, role: 'customer' };
      next();
    });

    // Mock isDriver to return a 403
    security.isDriver = jest.fn((req, res, next) => {
      res.status(403).json({ status: 'fail', message: 'You are not authorized to perform this action' });
    });

    // Create an individual instance of the app for this test
    app = express();
    const { router } = DriversController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .get('/drivers/1/orders/1/accept')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'You are not authorized to perform this action'
    });
  });

  it('should return a list of the driver\'s orders if authorized', async () => {
    const mockOrders = [{ id: 1, driverId: 1 }, { id: 2, driverId: 1 }];
    orderService.getOrdersByDriverId.mockResolvedValue(mockOrders);

    // Create an individual instance of the app for this test
    app = express();
    const { router } = DriversController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .get('/drivers/1/orders/history')
      .set('Authorization', 'Bearer token')

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { orders: mockOrders }
    });
    expect(orderService.getOrdersByDriverId).toHaveBeenCalledWith(1);
    expect(orderService.getOrdersByDriverId).toHaveBeenCalledTimes(1);
  });

  it('should return 403 if not authorized', async () => {
    // Mock user role as a different driver id
    security.authenticateJWT = jest.fn((req, res, next) => {
      req.user = { id: 2, role: 'driver' };
      next();
    });

    // Create an individual instance of the app for this test
    app = express();
    const { router } = DriversController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .get('/drivers/1/orders/history')
      .set('Authorization', 'Bearer token')

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'You are not authorized to view this driver\'s orders'
    });
  });
});