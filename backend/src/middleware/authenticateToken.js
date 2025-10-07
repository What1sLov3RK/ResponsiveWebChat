import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.error("Auth error:", err.message);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  });
};

export default authenticateToken;
