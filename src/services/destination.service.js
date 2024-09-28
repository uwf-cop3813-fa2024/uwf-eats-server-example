class DestinationService {
    constructor(prisma) {
        this.prisma = prisma;
    }

    async getDestinations() {
        return this.prisma.destination.findMany();
    }

    async getDestination(id) {
        return this.prisma.destination.findUnique({
            where: { id: parseInt(id) }
        });
    }
}

module.exports = DestinationService;