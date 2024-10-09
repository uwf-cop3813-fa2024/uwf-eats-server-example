class UserService {

  constructor(prisma, bcrypt) {
    this.prisma = prisma;
    this.bcrypt = bcrypt;
  }

  async updateUser(user) {
    const hashedPassword = await this.bcrypt.hash(user.password, 10);

    const toUpsert = {
      email: user.email,
      password: hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || "customer",
    };

    const newUser = await this.prisma.user.upsert({
      where: { email: user.email },
      update: { ...toUpsert },
      create: { ...toUpsert },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
  }

  async authentiticateUser(email, password) {
    // Find the user by username
    // This is asynchronous, so we need to await the result
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If the user exists and the password is correct, return the user
    if (user && await this.bcrypt.compare(password, user.password)) {
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        accountBalance: user.accountBalance,
      };
    } else {
      return null;
    }
  }
}

module.exports = UserService;