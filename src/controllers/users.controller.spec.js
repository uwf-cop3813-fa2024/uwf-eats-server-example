// Written with GitHub Copilot

const request = require('supertest');
const express = require('express');
const UsersController = require('./users.controller');

describe('UsersController', () => {
    let app;
    let userServiceMock;
    let tokenServiceMock;

    beforeEach(() => {
        userServiceMock = {
            authentiticateUser: jest.fn(),
            updateUser: jest.fn()
        };
        tokenServiceMock = {
            generateToken: jest.fn()
        };

        const usersController = UsersController(userServiceMock, tokenServiceMock);
        app = express();
        app.use(express.json());
        app.use('/users', usersController.router);
    });

    describe('POST /users/login', () => {
        it('should return a token and user for valid credentials', async () => {
            const user = { id: 1, email: 'test@example.com' };
            userServiceMock.authentiticateUser.mockResolvedValue(user);
            tokenServiceMock.generateToken.mockResolvedValue('fake-token');

            const response = await request(app)
                .post('/users/login')
                .send({ email: 'test@example.com', password: 'password' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: { token: 'fake-token', user: { id: 1, email: 'test@example.com' } }
            });
        });

        it('should return 401 for invalid credentials', async () => {
            userServiceMock.authentiticateUser.mockResolvedValue(null);

            const response = await request(app)
                .post('/users/login')
                .send({ email: 'test@example.com', password: 'wrong-password' });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                status: 'fail',
                message: 'Invalid credentials'
            });
        });
    });

    describe('POST /users/register', () => {
        it('should register a new user', async () => {
            const user = { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'customer' };
            userServiceMock.updateUser.mockResolvedValue(user);

            const response = await request(app)
                .post('/users/register')
                .send({ email: 'test@example.com', password: 'password', firstName: 'John', lastName: 'Doe', role: 'customer' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: { user }
            });
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ email: 'test@test.com'});
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                status: 'fail',
                message: 'Missing required fields'
            });
        });
    });
});