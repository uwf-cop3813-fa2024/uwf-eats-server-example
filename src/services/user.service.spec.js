const UserService = require('./user.service');

describe('User Service', () => {
    let prismaMock;
    let bcryptMock
    let userService;
    let user;

    beforeEach(() => {
        prismaMock = {
            user: {
                create: jest.fn(),
                upsert: jest.fn(),
                findUnique: jest.fn()
            }
        };

        bcryptMock = {
            hash: jest.fn(),
            compare: jest.fn()
        };

        userService = new UserService(prismaMock, bcryptMock);

        user = {
            id: 1,
            email: 'test@test.com',
            password: 'testpassword',
            firstName: 'Test',
            lastName: 'User',
            role: 'customer',
        };
    });

    describe('createUser', () => {
        it('should return a user', async () => {
            // Simulate the prisma create method
            prismaMock.user.upsert.mockReturnValue(user);

            // Simulate the bcrypt hash method
            bcryptMock.hash.mockReturnValue('hashedPassword');

            // Create the user
            const returnedUser = await userService.updateUser({ ...user });
            // Check that the user was returned
            expect(returnedUser.email).toEqual(user.email);

            expect(prismaMock.user.upsert).toHaveBeenCalledWith(
                {
                    "create":
                    {
                        "email": "test@test.com",
                        "firstName": "Test",
                        "lastName": "User",
                        "password": "hashedPassword",
                        "role": "customer",
                    },
                    "update": {
                        "email": "test@test.com",
                        "firstName": "Test",
                        "lastName": "User",
                        "password": "hashedPassword",
                        "role": "customer",
                    },
                    "where": {
                        "email":
                            "test@test.com"
                    }
                }
            );
            expect(bcryptMock.hash).toHaveBeenCalledWith(user.password, 10);
        });
    });

    describe('authenticateUser', () => {
        it('should retrieve a user', async () => {
            // Simulate the prisma findUnique method
            prismaMock.user.findUnique.mockReturnValue(user);

            // Simulate the bcrypt compare method
            bcryptMock.compare.mockReturnValue(true);

            // Authenticate the user
            const returnedUser = await userService.authentiticateUser(
                user.email,
                user.password
            );

            // Check that the user was returned
            expect(returnedUser.username).toEqual(user.username);

            expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
                where: { email: user.email }
            });
            expect(bcryptMock.compare).toHaveBeenCalledWith(user.password, user.password);
        });

        it('should return null if the user does not exist', async () => {
            prismaMock.user.findUnique.mockReturnValue(null);

            const returnedUser = await userService.authentiticateUser(
                user.username,
                user.password
            );

            expect(returnedUser).toBeNull();
        });

        it('should return null if the password is incorrect', async () => {
            prismaMock.user.findUnique.mockReturnValue(user);
            bcryptMock.compare.mockReturnValue(false);

            const returnedUser = await userService.authentiticateUser(
                user.username,
                user.password
            );

            expect(returnedUser).toBeNull();
        });
    });

});