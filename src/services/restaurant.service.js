class RestaurantService {
  constructor(prisma) {
      this.prisma = prisma;
  }

  async getRestaurants() {
      return this.prisma.restaurant.findMany();
  }

  async getRestaurantById(id) {
      return this.prisma.restaurant.findUnique({
          where: { id: parseInt(id) },
          include: { foods: true },
      });
  }
}

module.exports = RestaurantService;