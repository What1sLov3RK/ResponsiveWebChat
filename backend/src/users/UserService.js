import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UsersCommands from "../db/users/UsersCommands.js";
import Chat from "../db/models/Chats.model.js";
import User from "../db/models/Users.model.js";

dotenv.config();

class UserService {
  static async createUser(email, password, firstname, lastname) {
    const existing = await UsersCommands.findOneByEmail(email);
    if (existing) {
      return { ok: false, error: "User with this email already exists" };
    }

    const hashed = await bcrypt.hash(password, 5);
    const user = await UsersCommands.createUser(
      email,
      hashed,
      firstname,
      lastname
    );

    const tokens = await this.generateTokens(user.id, email);

    user.refresh_token = tokens.refresh_token;
    await user.save();

    const chatNames = ["Gimmel", "Aizen", "Frieren"];
    const chats = await Promise.all(
      chatNames.map((name) => Chat.create({ name, user: user._id }))
    );
    user.chats.push(...chats.map((c) => c._id));
    await user.save();

    return { ok: true, ...tokens };
  }

  static async login(email, password) {
    const user = await UsersCommands.findOneByEmail(email);
    if (!user) return { ok: false, error: "Incorrect email or password" };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { ok: false, error: "Incorrect email or password" };

    const tokens = await this.generateTokens(user.id, email);
    user.refresh_token = tokens.refresh_token;
    await user.save();

    return { ok: true, ...tokens, firstname: user.firstname, lastname: user.lastname  };
  }

  static async generateTokens(userId, email) {
    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const refreshSecret =
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    if (!accessSecret || !refreshSecret)
      throw new Error("JWT secrets are not defined");

    const payload = { userId, email };

    const access_token = jwt.sign(payload, accessSecret, { expiresIn: "15m" });
    const refresh_token = jwt.sign(payload, refreshSecret, {
      expiresIn: "7d",
    });

    return { access_token, refresh_token };
  }

  static async refreshToken(refreshToken) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!refreshSecret) throw new Error("JWT_SECRET not defined");

    if (!refreshToken || typeof refreshToken !== "string" || refreshToken.length < 20) {
      console.warn("refreshToken invalid or missing:", refreshToken);
      return { ok: false, error: "Invalid refresh token" };
    }

    try {
      const token = refreshToken.replace(/^Bearer\s+/i, "").trim();
      const decoded = jwt.verify(token, refreshSecret);
      const user = await User.findById(decoded.userId);

      if (!user) return { ok: false, error: "User not found" };
      if (user.refresh_token !== token)
        return { ok: false, error: "Invalid or expired refresh token" };

      const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
      const newAccessToken = jwt.sign(
        { userId: user._id, email: user.email },
        accessSecret,
        { expiresIn: "15m" }
      );

      return { ok: true, access_token: newAccessToken };
    } catch (e) {
      console.error("JWT verify failed:", e.message);
      return { ok: false, error: "Invalid or expired refresh token" };
    }
  }
}

export default UserService;
