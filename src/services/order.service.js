class OrderService {
  constructor(prisma) {
      this.prisma = prisma;
  }

  async getOrderById(id) {
      return this.prisma.order.findUnique({
          where: { id: parseInt(id) },
          include: { orderItems: { include: { food: true } } },
      });
  }

  async getOrdersVisibleToUser(userId) {
      return this.prisma.order.findMany({
          where: {
              OR: [
                  { customerId: userId },
                  { driverId: userId },
              ],
          },
          include: { orderItems: { include: { food: true } } },
      });
  }

  async getOrdersByDriverId(driverId) {
      return this.prisma.order.findMany({
          where: { driverId: driverId },
          include: { orderItems: { include: { food: true } } },
      });
  }

  async getOrdersByStatus(status) {
      return this.prisma.order.findMany({
          where: { status: status },
          include: { orderItems: { include: { food: true } } },
      });
  }

  async placeOrder(customerId, restaurantId, destinationId, orderItems) {
      return this.prisma.order.create({
          data: {
              customer: { connect: { id: customerId } },
              destination: { connect: { id: destinationId } },
              restaurant: { connect: { id: restaurantId } },
              orderItems: {
                  create: orderItems,
              },
          },
          include: { orderItems: { include: { food: true } } },
      });
  }

  async claimOrder(orderId, driverId) {
      return this.prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { status: "accepted", driverId: parseInt(driverId) },
          include: { orderItems: { include: { food: true } } },
      });
  }

  async updateOrderStatus(orderId, status) {
      return this.prisma.order.update({
          where: { id: parseInt(orderId) },
          data: { status: status },
          include: { orderItems: { include: { food: true } } },
      });
  }

  async computeOrderTotal(order) {
      return order.orderItems.reduce((total, orderItem) => {
          return total + orderItem.food.price * orderItem.quantity;
      }, 0);
  }

}

module.exports = OrderService;