class DestinationService {
    constructor(prisma) {
        this.prisma = prisma;
    }

    async getDestinations() {
        return this.prisma.destination.findMany();
    }

    async getDestinationById(id) {
        return this.prisma.destination.findUnique({
            where: { id: parseInt(id) }
        });
    }

    async createDestination(newDestination) {
        return this.prisma.destination.create({
            data: newDestination
        });
    }
}

module.exports = DestinationService;