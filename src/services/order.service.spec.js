const OrderService = require('./order.service');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    order: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
      const mockOrder = { id: 1, orderItems: [{ food: { price: 10 }, quantity: 2 }] };
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

  describe('getOrdersVisibleToUser', () => {
    it('should return orders visible to a user', async () => {
      const mockOrders = [{ id: 1 }, { id: 2 }];
      prisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersVisibleToUser(1);
      expect(result).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { customerId: 1 },
            { driverId: 1 },
          ],
        },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOrdersByDriverId', () => {
    it('should return orders by driver id', async () => {
      const mockOrders = [{ id: 1 }, { id: 2 }];
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

  describe('getOrdersByStatus', () => {
    it('should return orders by status', async () => {
      const mockOrders = [{ id: 1 }, { id: 2 }];
      prisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await orderService.getOrdersByStatus('pending');
      expect(result).toEqual(mockOrders);
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { status: 'pending' },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('placeOrder', () => {
    it('should place a new order', async () => {
      const mockOrder = { id: 1, orderItems: [{ food: { price: 10 }, quantity: 2 }] };
      prisma.order.create.mockResolvedValue(mockOrder);

      const result = await orderService.placeOrder(1, 1, 1, [{ foodId: 1, quantity: 2 }]);
      expect(result).toEqual(mockOrder);
      expect(prisma.order.create).toHaveBeenCalledWith({
        data: {
          customer: { connect: { id: 1 } },
          destination: { connect: { id: 1 } },
          restaurant: { connect: { id: 1 } },
          orderItems: {
            create: [{ foodId: 1, quantity: 2 }],
          },
        },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('claimOrder', () => {
    it('should claim an order', async () => {
      const mockOrder = { id: 1, status: 'accepted', driverId: 1, orderItems: [{ food: { price: 10 }, quantity: 2 }] };
      prisma.order.update.mockResolvedValue(mockOrder);

      const result = await orderService.claimOrder(1, 1);
      expect(result).toEqual(mockOrder);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'accepted', driverId: 1 },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the status of an order', async () => {
      const mockOrder = { id: 1, status: 'completed', orderItems: [{ food: { price: 10 }, quantity: 2 }] };
      prisma.order.update.mockResolvedValue(mockOrder);

      const result = await orderService.updateOrderStatus(1, 'completed');
      expect(result).toEqual(mockOrder);
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'completed' },
        include: { orderItems: { include: { food: true } } },
      });
      expect(prisma.order.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('computeOrderTotal', () => {
    it('should compute the total of an order', async () => {
      const mockOrder = { orderItems: [{ food: { price: 10 }, quantity: 2 }, { food: { price: 5 }, quantity: 3 }] };
      const result = await orderService.computeOrderTotal(mockOrder);
      expect(result).toBe(35);
    });
  });
});