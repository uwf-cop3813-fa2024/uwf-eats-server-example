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

    return { authenticateJWT };
};

module.exports = SecurityMiddleware;