class TokenService {

  constructor(jwtService, jwtSecret, expiresIn) {
    this.jwtService = jwtService;
    this.JWT_SECRET = jwtSecret;
    this.EXPIRES_IN = expiresIn;
  }

  async generateToken(user) {
    const options = { expiresIn: this.EXPIRES_IN };
    const token = this.jwtService.sign({ user }, this.JWT_SECRET, options);
    return token;
  }

  async verifyToken(token) {
    try {
      return this.jwtService.verify(token, this.JWT_SECRET);
    } catch (err) {
      return null;
    }
  }
}

module.exports = TokenService;