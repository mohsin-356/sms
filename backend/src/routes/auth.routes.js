import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.post(
  '/login',
  [body('email').isEmail(), body('password').isString().isLength({ min: 6 })],
  validate,
  authController.login
);

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isString().isLength({ min: 6 }),
    body('name').optional().isString(),
    body('role').optional().isIn(['admin', 'teacher', 'student', 'driver']),
  ],
  validate,
  authController.register
);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh', [body('refreshToken').isString()], validate, authController.refresh);
router.get('/profile', authenticate, authController.profile);
router.get('/users', authenticate, authController.getAllUsers);
router.get('/users/:id', authenticate, authController.getUserById);

// Create missing user accounts from domain tables by role
router.post(
  '/backfill-users',
  authenticate,
  authorize('admin'),
  [body('role').isIn(['student','teacher','driver'])],
  validate,
  authController.backfillUsers
);

export default router;
