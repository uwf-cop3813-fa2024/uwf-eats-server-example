const OrderService = require('./order.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('OrderService', () => {
  let orderService;

  beforeEach(() => {
    orderService = new OrderService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('should return an order by id', async () => {
      const mockOrder = { id: 1, orderItems: [{ food: {} }] };
      prisma.order.findUnique.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById(1);
      expect(result).toEqual(mockOrder);
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return null if order not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      const result = await orderService.getOrderById(999);
      expect(result).toBeNull();
      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrdersByCustomerId', () => {
    it('should return orders by customer id', async () => {
      const mockOrders = [{ id: 1, orderItems: [{ food: {} }] }];
      prisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByCustomerId(1);
      expect(result).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { customerId: 1 },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrdersByDriverId', () => {
    it('should return orders by driver id', async () => {
      const mockOrders = [{ id: 1, orderItems: [{ food: {} }] }];
      prisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByDriverId(1);
      expect(result).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { driverId: 1 },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('placeOrder', () => {
    it('should create a new order', async () => {
      const mockOrder = { id: 1, orderItems: [{ food: {} }] };
      const orderItems = [{ foodId: 1, quantity: 2 }];
      prisma.order.create.mockResolvedValue(mockOrder);

      const result = await orderService.placeOrder(1, 1, orderItems);
      expect(result).toEqual(mockOrder);
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          restaurantId: 1,
          orderItems: {
            create: orderItems,
          },
        },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.create).toHaveBeenCalledTimes(1);
    });
  });
});