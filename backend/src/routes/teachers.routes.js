import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as teacherController from '../controllers/teachers.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
    query('q').optional().isString(),
  ],
  validate,
  teacherController.list
);

router.get(
  '/:id',
  authenticate,
  [param('id').isInt()],
  validate,
  teacherController.getById
);

router.get(
  '/:id/schedule',
  authenticate,
  [param('id').isInt()],
  validate,
  teacherController.getSchedule
);

const optionalString = (field) => body(field).optional({ checkFalsy: true }).isString().trim();

const sharedOptionalValidators = [
  body('experienceYears').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  optionalString('specialization'),
  body('probationEndDate').optional({ checkFalsy: true }).isISO8601(),
  body('contractEndDate').optional({ checkFalsy: true }).isISO8601(),
  body('workHoursPerWeek').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('allowances').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('deductions').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('currency').optional({ checkFalsy: true }).isLength({ min: 1, max: 8 }),
  body('payFrequency').optional({ checkFalsy: true }).isIn(['monthly', 'biweekly', 'weekly']),
  body('paymentMethod').optional({ checkFalsy: true }).isIn(['bank', 'cash', 'cheque']),
  optionalString('bankName'),
  optionalString('accountNumber'),
  optionalString('iban'),
  optionalString('bloodGroup'),
  optionalString('religion'),
  optionalString('nationalId'),
  optionalString('address1'),
  optionalString('address2'),
  optionalString('city'),
  optionalString('state'),
  optionalString('postalCode'),
  optionalString('emergencyName'),
  optionalString('emergencyPhone'),
  optionalString('emergencyRelation'),
  optionalString('avatar'),
];

const createTeacherValidators = [
  body('name').isString().trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').isString().trim().notEmpty(),
  body('qualification').isString().trim().notEmpty(),
  body('employmentType').isIn(['fullTime', 'partTime']),
  body('employmentStatus').optional({ checkFalsy: true }).isIn(['active', 'inactive', 'on_leave', 'resigned']),
  body('joiningDate').isISO8601(),
  body('employeeId').isString().trim().notEmpty(),
  body('department').isString().trim().notEmpty(),
  body('designation').isString().trim().notEmpty(),
  body('gender').isIn(['male', 'female', 'other']),
  body('dob').isISO8601(),
  body('subjects').isArray({ min: 1 }),
  body('subjects.*').isString().trim().notEmpty(),
  body('classes').isArray({ min: 1 }),
  body('classes.*').isString().trim().notEmpty(),
  body('baseSalary').isFloat({ min: 0 }),
  ...sharedOptionalValidators,
];

const updateTeacherValidators = [
  body('name').optional({ nullable: true }).isString().trim().notEmpty(),
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  body('phone').optional({ nullable: true }).isString().trim().notEmpty(),
  body('qualification').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('employmentType').optional({ checkFalsy: true }).isIn(['fullTime', 'partTime']),
  body('joiningDate').optional({ checkFalsy: true }).isISO8601(),
  body('employeeId').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('department').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('designation').optional({ checkFalsy: true }).isString().trim().notEmpty(),
  body('gender').optional({ checkFalsy: true }).isIn(['male', 'female', 'other']),
  body('dob').optional({ checkFalsy: true }).isISO8601(),
  body('subjects').optional().isArray({ min: 1 }),
  body('subjects.*').optional().isString().trim().notEmpty(),
  body('classes').optional().isArray({ min: 1 }),
  body('classes.*').optional().isString().trim().notEmpty(),
  body('baseSalary').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  ...sharedOptionalValidators,
];

router.post(
  '/',
  authenticate,
  authorize('admin'),
  createTeacherValidators,
  validate,
  teacherController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isInt(), ...updateTeacherValidators],
  validate,
  teacherController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  [param('id').isInt()],
  validate,
  teacherController.remove
);

export default router;
