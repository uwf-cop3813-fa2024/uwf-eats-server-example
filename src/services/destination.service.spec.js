const DestinationService = require('./destination.service');

describe('DestinationService', () => {
    let destinationService;
    let mockPrisma;

    beforeEach(() => {
        mockPrisma = {
            destination: {
                findMany: jest.fn(),
                findUnique: jest.fn()
            }
        };
        destinationService = new DestinationService(mockPrisma);
    });

    describe('getDestinations', () => {
        it('should return all destinations', async () => {
            const mockDestinations = [
                { id: 1, name: 'Destination 1' },
                { id: 2, name: 'Destination 2' }
            ];
            mockPrisma.destination.findMany.mockResolvedValue(mockDestinations);

            const destinations = await destinationService.getDestinations();

            expect(destinations).toEqual(mockDestinations);
            expect(mockPrisma.destination.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('getDestinationById', () => {
        it('should return a single destination by id', async () => {
            const mockDestination = { id: 1, name: 'Destination 1' };
            mockPrisma.destination.findUnique.mockResolvedValue(mockDestination);

            const destination = await destinationService.getDestinationById(1);

            expect(destination).toEqual(mockDestination);
            expect(mockPrisma.destination.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(mockPrisma.destination.findUnique).toHaveBeenCalledTimes(1);
        });

        it('should return null if destination is not found', async () => {
            mockPrisma.destination.findUnique.mockResolvedValue(null);

            const destination = await destinationService.getDestinationById(999);

            expect(destination).toBeNull();
            expect(mockPrisma.destination.findUnique).toHaveBeenCalledWith({
                where: { id: 999 }
            });
            expect(mockPrisma.destination.findUnique).toHaveBeenCalledTimes(1);
        });
    });
});