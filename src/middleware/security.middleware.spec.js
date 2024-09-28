// Implemented with Github Copilot

const request = require('supertest');
const express = require('express');
const SecurityMiddleware = require('./security.middleware');

describe('SecurityMiddleware', () => {
    let app;
    let tokenServiceMock;

    beforeEach(() => {
        tokenServiceMock = {
            verifyToken: jest.fn()
        };

        const securityMiddleware = SecurityMiddleware(tokenServiceMock);

        app = express();
        app.use(securityMiddleware.authenticateJWT);
        app.get('/test', (req, res) => {
            res.status(200).json({ message: 'Success', user: req.user });
        });
    });

    it('should return 401 if no authorization header is present', async () => {
        const response = await request(app).get('/test');
        expect(response.status).toBe(401);
    });

    it('should return 403 if token is invalid', async () => {
        tokenServiceMock.verifyToken.mockResolvedValue(null);

        const response = await request(app)
            .get('/test')
            .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(403);
    });

    it('should call next and attach user to request if token is valid', async () => {
        const mockUser = { id: 1, name: 'Test User' };
        tokenServiceMock.verifyToken.mockResolvedValue(mockUser);

        const response = await request(app)
            .get('/test')
            .set('Authorization', 'Bearer validtoken');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Success', user: mockUser });
    });
});