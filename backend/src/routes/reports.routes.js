import { Router } from 'express';
import { query } from 'express-validator';
import * as controller from '../controllers/reports.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get('/overview', authenticate, authorize('admin'), controller.overview);

router.get(
  '/attendance-summary',
  authenticate,
  authorize('admin'),
  [query('fromDate').optional().isISO8601(), query('toDate').optional().isISO8601()],
  validate,
  controller.attendanceSummary
);

router.get(
  '/finance-summary',
  authenticate,
  authorize('admin'),
  [query('fromDate').optional().isISO8601(), query('toDate').optional().isISO8601()],
  validate,
  controller.financeSummary
);

router.get(
  '/exam-performance',
  authenticate,
  authorize('admin'),
  [query('examId').optional().isInt()],
  validate,
  controller.examPerformance
);

export default router;
