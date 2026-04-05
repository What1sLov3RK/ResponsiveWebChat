import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import UserController from './UserController.js';
import { logger } from '../../logger.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { authenticateToken } from '../../middleware/authenticateToken.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  },
});

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

router.get('/me', authenticateToken, asyncHandler(UserController.getMe));

router.get('/logout', validateRequest, asyncHandler(UserController.logout));

router.post(
  '/profile-image',
  authenticateToken,
  upload.single('profileImage'),
  asyncHandler(UserController.uploadProfileImage),
);

export default router;
