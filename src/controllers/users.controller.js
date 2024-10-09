const UsersController = (userService, tokenService) => {

    const router = require("express").Router();

    router.post("/login", async (req, res) => {
        const { email, password } = req.body;
        const user = await userService.authentiticateUser(email, password);
        if (user) {
            const token = await tokenService.generateToken(user);
            res.json({
                status: "success",
                data: { 
                    token: token, 
                    user: { 
                        id: user.id,
                        email: user.email, 
                        firstName: user.firstName, 
                        lastName: user.lastName, 
                        role: user.role,
                        accountBalance: user.accountBalance
                    } 
                }
            });
        } else {
            res.status(401).json({
                status: "fail",
                message: "Invalid credentials"
            });
        }
    });

    router.post("/register", async (req, res) => {
        const { email, password, firstName, lastName, role } = req.body;

        if(!email || !password || !firstName || !lastName || !role) {
            res.status(400).json({
                status: "fail",
                message: "Missing required fields"
            });
            return;
        }
        const user = await userService.updateUser(req.body);
        res.json({
            status: "success",
            data: { user }
        });
    });

    return { router };
};

module.exports = UsersController;