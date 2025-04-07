const User = require("../models/user.model.js");
const logger = require("../utils/logger.js");
const { generateuserID } = require("../utils/user.utils.js");

class AuthService {
  async registerUser({ email, password, username, fullName }) {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      logger.warn(
        `Registration failed: Email or username exists - ${email}, ${username}`
      );
      throw new Error("Email or username already exists");
    }

    const userID = await generateuserID();
    const user = new User({
      email: normalizedEmail,
      password,
      username: username.toLowerCase(),
      fullName,
      userID,
    });

    await user.save();
    logger.info(`User registered successfully: ${username}`);
    return user; // Return the user object
  }
}

module.exports = new AuthService();
