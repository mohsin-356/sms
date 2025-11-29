import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('studentId').optional().isInt(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.list
);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  controller.getById
);

router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  [
    body('studentId').isInt(),
    body('date').isISO8601(),
    body('status').isIn(['present', 'absent', 'late']),
    body('remarks').optional().isString(),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  [param('id').isInt()],
  validate,
  controller.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isInt()],
  validate,
  controller.remove
);

export default router;
