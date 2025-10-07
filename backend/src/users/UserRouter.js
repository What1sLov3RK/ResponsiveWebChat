import { Router } from "express";
import { body, validationResult } from "express-validator";
import UserController from "./UserController.js";

const router = Router();

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }
};

router.post(
  "/registration",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const v = validate(req, res);
    if (v) return;
    await UserController.signup(req, res);
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const v = validate(req, res);
    if (v) return;
    await UserController.login(req, res);
  }
);

router.post(
  "/refresh-token",
  [body("refreshToken").notEmpty().withMessage("Missing refresh token")],
  async (req, res) => {
    const v = validate(req, res);
    if (v) return;
    await UserController.refreshToken(req, res);
  }
);

export default router;
