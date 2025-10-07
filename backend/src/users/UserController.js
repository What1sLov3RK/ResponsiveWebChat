import UserService from "./UserService.js";

class UserController {
  static async signup(req, res) {
    try {
      const { email, password, firstname, lastname } = req.body;
      const result = await UserService.createUser(email, password, firstname, lastname);
      if (!result.ok) return res.status(400).json(result);
      return res.status(201).json(result);
    } catch (e) {
      console.error("Signup error:", e);
      return res.status(500).json({ ok: false, error: "Server error during signup" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await UserService.login(email, password);
      if (!result.ok) return res.status(401).json(result);
      return res.status(200).json(result);
    } catch (e) {
      console.error("Login error:", e);
      return res.status(500).json({ ok: false, error: "Server error during login" });
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const result = await UserService.refreshToken(refreshToken);
      if (!result.ok) return res.status(401).json(result);
      return res.status(200).json(result);
    } catch (e) {
      console.error("Refresh token error:", e);
      return res.status(500).json({ ok: false, error: "Server error during token refresh" });
    }
  }
}

export default UserController;
