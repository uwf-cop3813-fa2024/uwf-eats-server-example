// Written with GitHub Copilot

const request = require('supertest');
const express = require('express');
const DestinationsController = require('./destinations.controller');

describe('DestinationsController', () => {
    let app;
    let securityMock;
    let destinationServiceMock;

    beforeEach(() => {
        securityMock = {
            authenticateJWT: jest.fn((req, res, next) => next()),
            isAdmin: jest.fn((req, res, next) => next()),
        };

        destinationServiceMock = {
            getDestinations: jest.fn(),
            getDestinationById: jest.fn(),
            createDestination: jest.fn()
        };

        app = express();
        app.use(express.json()); // Ensure we can parse JSON sent to us
        const controller = DestinationsController(securityMock, destinationServiceMock);
        app.use(controller.router);
    });

    it('should return a list of destinations', async () => {
        
        //Arrange
        const mockDestinations = [{ id: 1, name: 'Destination 1' }, { id: 2, name: 'Destination 2' }];
        destinationServiceMock.getDestinations.mockResolvedValue(mockDestinations);

        // Act
        const response = await request(app).get('/destinations');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'success',
            data: { destinations: mockDestinations }
        });
        expect(destinationServiceMock.getDestinations).toHaveBeenCalled();
    });

    it('should return a single destination', async () => {
        const mockDestination = { id: 1, name: 'Destination 1' };
        destinationServiceMock.getDestinationById.mockResolvedValue(mockDestination);

        const response = await request(app).get('/destinations/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'success',
            data: { destination: mockDestination }
        });
        expect(destinationServiceMock.getDestinationById).toHaveBeenCalledWith(1);
    });

    it('should return 404 if destination not found', async () => {
        destinationServiceMock.getDestinationById.mockResolvedValue(null);

        const response = await request(app).get('/destinations/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            status: 'fail',
            message: 'Destination not found'
        });
        expect(destinationServiceMock.getDestinationById).toHaveBeenCalledWith(999);
    });

    it('should enforce authentication', async () => {
        await request(app).get('/destinations');
        expect(securityMock.authenticateJWT).toHaveBeenCalled();
    });

    it('should create a new destination', async () => {
        // Arrange
        // Set up the mock for the createDestination() call
        const mockDestination = { id: 1, name: 'Destination 1' };
        destinationServiceMock.createDestination.mockResolvedValue(mockDestination);

        // Create a fake body to post to the controller
        const newDest = {
            name: "test destination",
            address: "test",
            phone: "test",
            notes: "test",
        };


        // Act - simulate a call to POST /destinations
        const response = await request(app)
            .post('/destinations')
            .send(newDest);

        // Assert

        // Make sure we get back a 200, the payload returned is ok,
        // and that we called the service with the right info
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'success',
            data: mockDestination
        });
    });

});