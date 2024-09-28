const request = require('supertest');
const express = require('express');
const RestaurantsController = require('./restaurants.controller');

describe('RestaurantsController', () => {
  let app;
  let security;
  let restaurantsService;

  beforeEach(() => {
    security = {
      authenticateJWT: jest.fn((req, res, next) => next())
    };

    restaurantsService = {
      getRestaurants: jest.fn(),
      getRestaurant: jest.fn()
    };

    app = express();
    const { router } = RestaurantsController(security, restaurantsService);
    app.use(express.json());
    app.use(router);
  });

  test('GET /restaurants should return a list of restaurants', async () => {
    const mockRestaurants = [{ id: 1, name: 'Restaurant 1' }, { id: 2, name: 'Restaurant 2' }];
    restaurantsService.getRestaurants.mockResolvedValue(mockRestaurants);

    const response = await request(app).get('/restaurants');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { restaurants: mockRestaurants }
    });
    expect(restaurantsService.getRestaurants).toHaveBeenCalledTimes(1);
  });

  test('GET /restaurants/:id should return a single restaurant if found', async () => {
    const mockRestaurant = { id: 1, name: 'Restaurant 1' };
    restaurantsService.getRestaurant.mockResolvedValue(mockRestaurant);

    const response = await request(app).get('/restaurants/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'success',
      data: { restaurant: mockRestaurant }
    });
    expect(restaurantsService.getRestaurant).toHaveBeenCalledWith(1);
    expect(restaurantsService.getRestaurant).toHaveBeenCalledTimes(1);
  });

  test('GET /restaurants/:id should return 404 if restaurant not found', async () => {
    restaurantsService.getRestaurant.mockResolvedValue(null);

    const response = await request(app).get('/restaurants/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'fail',
      data: { restaurant: 'Not found' }
    });
    expect(restaurantsService.getRestaurant).toHaveBeenCalledWith(999);
    expect(restaurantsService.getRestaurant).toHaveBeenCalledTimes(1);
  });
});