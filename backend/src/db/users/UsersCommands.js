import User from "../models/Users.model.js";

class UsersCommands {
  static async createUser(email, password, firstname, lastname) {
    try {
      const newUser = await User.create({
        email,
        password,
        firstname,
        lastname,
        refresh_token: "",
        chats: [],
      });
      return newUser;
    } catch (e) {
      console.error("Error creating user:", e);
      throw e;
    }
  }

  static async findOneById(userId) {
    try {
      return await User.findById(userId);
    } catch (e) {
      console.error("Error finding user by ID:", e);
      throw e;
    }
  }

  static async findOneByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (e) {
      console.error("Error finding user by email:", e);
      throw e;
    }
  }

  static async updateRefreshToken(userId, refreshToken) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found when updating refresh token");
      user.refresh_token = refreshToken;
      await user.save(); // ensure DB write
      return refreshToken;
    } catch (e) {
      console.error("Error updating refresh token:", e);
      throw e;
    }
  }
}

export default UsersCommands;
