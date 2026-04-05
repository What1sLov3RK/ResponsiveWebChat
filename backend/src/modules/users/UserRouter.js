import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import UserController from './UserController.js';
import { logger } from '../../logger.js';
import asyncHandler from '../../utils/asyncHandler.js';

const router = Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(errors);
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => e.msg),
    });
  }
  next();
};

router.post(
  '/registration',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('firstname').trim().notEmpty().withMessage('First name is required'),
    body('lastname').trim().notEmpty().withMessage('Last name is required'),
  ],
  validateRequest,
  asyncHandler(UserController.register),
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  validateRequest,
  asyncHandler(UserController.login),
);

router.post('/refresh', validateRequest, asyncHandler(UserController.refreshToken));

router.get('/logout', validateRequest, asyncHandler(UserController.logout));

export default router;
