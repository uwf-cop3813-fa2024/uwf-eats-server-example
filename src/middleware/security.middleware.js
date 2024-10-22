const SecurityMiddleware = (tokenService) => {
    const authenticateJWT = async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            // Separate the JWT from the "Bearer" prefix
            const token = authHeader.split(' ')[1];

            const verifiedToken = await tokenService.verifyToken(token);
            if (verifiedToken) {
                // We save the user object in the request so it's accessible down the line
                req.user = verifiedToken.user;
                next();
            } else {
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(401);
        }
    };

    const isCustomer = (req, res, next) => {
        if (req.user.role === 'customer') {
            next();
        } else {
            res.status(403)
            .json({ status: "fail", message: "You are not authorized to perform this action" });
        }
    };

    const isDriver = (req, res, next) => {
        if (req.user.role === 'driver') {
            next();
        } else {
            res.status(403)
            .json({ status: "fail", message: "You are not authorized to perform this action" });
        }
    };

    // Returns an object with the middleware functions
    return { authenticateJWT, isCustomer, isDriver, isAdmin };
};

module.exports = SecurityMiddleware;