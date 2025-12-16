import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/parents.controller.js';

const router = Router();

// Admin management endpoints
router.get('/', authenticate, authorize('admin'), controller.list);
router.get('/:id', authenticate, authorize('admin'), controller.getById);
router.post('/', authenticate, authorize('admin'), controller.create);
router.put('/:id', authenticate, authorize('admin'), controller.update);
router.post('/:id/inform', authenticate, authorize('admin'), controller.inform);

export default router;
