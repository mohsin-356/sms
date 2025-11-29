import { Router } from 'express';
import { overview } from '../controllers/dashboard.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Admin-only dashboard overview metrics
router.get('/overview', authenticate, authorize('admin'), overview);

export default router;
