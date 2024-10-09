const request = require('supertest');
const express = require('express');
const OrdersController = require('./orders.controller');

describe('OrdersController', () => {
  let app;
  let security;
  let orderService;

  beforeEach(() => {
    security = {
      authenticateJWT: jest.fn((req, res, next) => {
      req.user = { id: 1 }; // Create a user object in req.user
      next();
      })
    };

    orderService = {
      getOrdersVisibleToUser: jest.fn(),
      placeOrder: jest.fn(),
      getOrderById: jest.fn(),
      updateOrderStatus: jest.fn()
    };

  });

  test('GET /orders should return a list of orders', async () => {
    const mockOrders = [{ id: 1, items: [] }, { id: 2, items: [] }];
    orderService.getOrdersVisibleToUser.mockResolvedValue(mockOrders);

    app = express();
    const { router } = OrdersController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app).get('/orders');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { orders: mockOrders }
    });
    // Should be called with user id 1
    expect(orderService.getOrdersVisibleToUser).toHaveBeenCalledWith(1);
    expect(orderService.getOrdersVisibleToUser).toHaveBeenCalledTimes(1);
  });

  test('POST /orders should place a new order', async () => {
    const mockOrder = { id: 1, items: [] };
    orderService.placeOrder.mockResolvedValue(mockOrder);

    app = express();
    const { router } = OrdersController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .post('/orders')
      .send({ restaurantId: 1, destinationId: 1, orderItems: [{ foodId: 1, quantity: 2 }] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { order: mockOrder }
    });
    // Should be called with user id 1, restaurant id 1, destination id 1, and order items
    expect(orderService.placeOrder).toHaveBeenCalledWith(1, 1, 1, [{ foodId: 1, quantity: 2 }]);
    expect(orderService.placeOrder).toHaveBeenCalledTimes(1);
  });

  test('POST /orders should return 400 if required fields are missing', async () => {
    app = express();
    const { router } = OrdersController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .post('/orders')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'Missing required fields: restaurantId, destinationId, and orderItems'
    });
  });

  test('PUT /orders/:id should update an order status', async () => {
    // Create a mock order that has a driver id of 3
    const mockOrder = { id: 1, customerId: 1, driverId: 3, status: 'pending' };
    orderService.getOrderById.mockResolvedValue(mockOrder);
    const updatedOrder = { ...mockOrder, status: 'completed' };
    orderService.updateOrderStatus.mockResolvedValue(updatedOrder);
    
    // Create a mock user with an id of 3 and role of driver
    const updatedUser = { id: 3, role: 'driver' };
    security.authenticateJWT = jest.fn((req, res, next) => {
      req.user = updatedUser;
      next();
    });

    app = express();
    const { router } = OrdersController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app)
      .put('/orders/1')
      .send({ status: 'completed' });

    // It should allow this to happen 
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { order: updatedOrder }
    });
    expect(orderService.getOrderById).toHaveBeenCalledWith(1);
    expect(orderService.updateOrderStatus).toHaveBeenCalledWith(1, 'completed');
  });

  test('GET /orders/:id should return a single order if found', async () => {
    const mockOrder = { id: 1, customerId: 1, items: [] };
    orderService.getOrderById.mockResolvedValue(mockOrder);

    app = express();
    const { router } = OrdersController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app).get('/orders/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { order: mockOrder }
    });
    expect(orderService.getOrderById).toHaveBeenCalledWith(1);
    expect(orderService.getOrderById).toHaveBeenCalledTimes(1);
  });

  test('GET /orders/:id should return 404 if order not found', async () => {
    orderService.getOrderById.mockResolvedValue(null);

    app = express();
    const { router } = OrdersController(security, orderService);
    app.use(express.json());
    app.use(router);

    const response = await request(app).get('/orders/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'fail',
      message: 'Order not found'
    });
    expect(orderService.getOrderById).toHaveBeenCalledWith(999);
    expect(orderService.getOrderById).toHaveBeenCalledTimes(1);
  });
});