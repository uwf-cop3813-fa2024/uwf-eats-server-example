const RestaurantService = require('./restaurant.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    restaurant: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('RestaurantService', () => {
  let restaurantService;

  beforeEach(() => {
    restaurantService = new RestaurantService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRestaurants', () => {
    it('should return a list of restaurants', async () => {
      const mockRestaurants = [{ id: 1, name: 'Restaurant 1' }, { id: 2, name: 'Restaurant 2' }];
      prisma.restaurant.findMany.mockResolvedValue(mockRestaurants);

      const result = await restaurantService.getRestaurants();
      expect(result).toEqual(mockRestaurants);
      expect(prisma.restaurant.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRestaurantById', () => {
    it('should return a single restaurant by id', async () => {
      const mockRestaurant = { id: 1, name: 'Restaurant 1', foods: [] };
      prisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const result = await restaurantService.getRestaurantById(1);
      expect(result).toEqual(mockRestaurant);
      expect(prisma.restaurant.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { foods: true },
      });
      expect(prisma.restaurant.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if restaurant not found', async () => {
      prisma.restaurant.findUnique.mockResolvedValue(null);

      const result = await restaurantService.getRestaurantById(999);
      expect(result).toBeNull();
      expect(prisma.restaurant.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { foods: true },
      });
      expect(prisma.restaurant.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});