import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controller from '../controllers/finance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.get(
  '/invoices',
  authenticate,
  [
    query('studentId').optional().isInt(),
    query('status').optional().isIn(['pending','paid','overdue']),
    query('page').optional().isInt({ min: 1 }),
    query('pageSize').optional().isInt({ min: 1, max: 200 }),
  ],
  validate,
  controller.listInvoices
);

router.get('/invoices/:id', authenticate, [param('id').isInt()], validate, controller.getInvoiceById);

router.post(
  '/invoices',
  authenticate,
  authorize('admin'),
  [body('studentId').isInt(), body('amount').isFloat({ gt: 0 }), body('status').optional().isIn(['pending','paid','overdue']), body('dueDate').optional().isISO8601()],
  validate,
  controller.createInvoice
);

router.put('/invoices/:id', authenticate, authorize('admin'), [param('id').isInt()], validate, controller.updateInvoice);
router.delete('/invoices/:id', authenticate, authorize('admin'), [param('id').isInt()], validate, controller.deleteInvoice);

router.get('/invoices/:id/payments', authenticate, [param('id').isInt()], validate, controller.listPayments);
router.post('/invoices/:id/payments', authenticate, authorize('admin'), [param('id').isInt(), body('amount').isFloat({ gt: 0 }), body('method').optional().isString()], validate, controller.addPayment);

export default router;
