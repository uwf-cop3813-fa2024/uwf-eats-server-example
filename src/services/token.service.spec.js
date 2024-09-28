const TokenService = require("./token.service");

describe("Token Service", () => {
    let tokenService;
    let user;

    beforeEach(() => {
        jwtService = {
            sign: jest.fn(),
            verify: jest.fn(),
        };

        tokenService = new TokenService(jwtService, "secret", 3600);
        user = {
            id: 1,
            email: "[email protected]",
            username: "user",
            password: "password",
        };
    });

    describe("generateToken", () => {
        it("should return a token", async () => {
            // Override the value that jwtService.sign returns
            jwtService.sign.mockReturnValue("token");

            // Generate the token. It should come back as "token"
            const token = await tokenService.generateToken(user);
            expect(token).toBe("token");
            expect(jwtService.sign).toHaveBeenCalledWith({ user }, "secret", { expiresIn: 3600 });
        });
    });

    describe("verifyToken", () => {
        it("should return a user", async () => {
            // Override the value that jwtService.verify returns
            jwtService.verify.mockReturnValue({ user });

            const result = await tokenService.verifyToken("token");
            expect(result.user).toEqual(user);
            expect(jwtService.verify).toHaveBeenCalledWith("token", "secret");
        });

        it("should return null if the token is not valid", async () => {
            jwtService.verify.mockImplementation(() => {
                return null;
            });
            const verifiedUser = await tokenService.verifyToken("token");
            expect(verifiedUser).toBeNull();
        });

        it("should return null if an error occurs", async () => {
            jwtService.verify.mockImplementation(() => {
                throw new Error();
            });
            const verifiedUser = await tokenService.verifyToken("token");
            expect(verifiedUser).toBeNull();
        });
    });
});
