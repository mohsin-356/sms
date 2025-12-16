import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as controller from '../controllers/rbac.controller.js';

const router = Router();

router.get('/roles', authenticate, authorize('admin'), controller.listRoles);
router.put(
  '/roles/:role/active',
  authenticate,
  authorize('admin'),
  [param('role').isIn(['admin','teacher','student','driver']), body('active').isBoolean()],
  validate,
  controller.setRoleActive
);

router.get('/permissions', authenticate, authorize('admin'), controller.listPermissions);
router.put(
  '/permissions/:role',
  authenticate,
  authorize('admin'),
  [param('role').isIn(['admin','teacher','student','driver']), body('perms').isArray()],
  validate,
  controller.setPermissionsForRole
);

export default router;
