import { query } from '../config/db.js';

export const listInvoices = async ({ studentId, status, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];
  if (studentId) { params.push(studentId); where.push(`student_id = $${params.length}`); }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt"
     FROM fee_invoices ${whereSql}
     ORDER BY id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const getInvoiceById = async (id) => {
  const { rows } = await query(
    'SELECT id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt" FROM fee_invoices WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const createInvoice = async ({ studentId, amount, status, dueDate }) => {
  const { rows } = await query(
    'INSERT INTO fee_invoices (student_id, amount, status, due_date) VALUES ($1,$2,COALESCE($3,\'pending\'),$4) RETURNING id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt"',
    [studentId, amount, status || null, dueDate || null]
  );
  return rows[0];
};

export const updateInvoice = async (id, { amount, status, dueDate }) => {
  const { rows } = await query(
    'UPDATE fee_invoices SET amount = COALESCE($2,amount), status = COALESCE($3,status), due_date = COALESCE($4,due_date) WHERE id = $1 RETURNING id, student_id AS "studentId", amount, status, due_date AS "dueDate", issued_at AS "issuedAt"',
    [id, amount || null, status || null, dueDate || null]
  );
  return rows[0] || null;
};

export const deleteInvoice = async (id) => {
  await query('DELETE FROM fee_invoices WHERE id = $1', [id]);
  return true;
};

export const listPayments = async (invoiceId) => {
  const { rows } = await query(
    'SELECT id, invoice_id AS "invoiceId", amount, method, paid_at AS "paidAt" FROM fee_payments WHERE invoice_id = $1 ORDER BY paid_at DESC',
    [invoiceId]
  );
  return rows;
};

export const addPayment = async (invoiceId, { amount, method }) => {
  const { rows } = await query(
    'INSERT INTO fee_payments (invoice_id, amount, method) VALUES ($1,$2,$3) RETURNING id, invoice_id AS "invoiceId", amount, method, paid_at AS "paidAt"',
    [invoiceId, amount, method || null]
  );
  // Optionally update invoice status to paid if fully paid (skipped for simplicity)
  return rows[0];
};
