import { query } from '../config/db.js';

export const getOverview = async () => {
  const [students, teachers, assignments, invoices] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM students'),
    query('SELECT COUNT(*)::int AS count FROM teachers'),
    query('SELECT COUNT(*)::int AS count FROM assignments'),
    query("SELECT SUM(CASE WHEN status='paid' THEN 1 ELSE 0 END)::int AS paid, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END)::int AS pending, SUM(CASE WHEN status='overdue' THEN 1 ELSE 0 END)::int AS overdue FROM fee_invoices"),
  ]);

  return {
    students: students.rows[0].count,
    teachers: teachers.rows[0].count,
    assignments: assignments.rows[0].count,
    finance: invoices.rows[0],
  };
};

export const getAttendanceSummary = async ({ fromDate, toDate }) => {
  const params = [];
  const where = [];
  if (fromDate) { params.push(fromDate); where.push(`date >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`date <= $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT status, COUNT(*)::int AS count FROM attendance_records ${whereSql} GROUP BY status`,
    params
  );
  const counts = { present: 0, absent: 0, late: 0 };
  for (const r of rows) counts[r.status] = Number(r.count);
  const total = counts.present + counts.absent + counts.late;
  const pct = total ? {
    present: +(counts.present * 100 / total).toFixed(2),
    absent: +(counts.absent * 100 / total).toFixed(2),
    late: +(counts.late * 100 / total).toFixed(2),
  } : { present: 0, absent: 0, late: 0 };
  return { counts, total, pct };
};

export const getFinanceSummary = async ({ fromDate, toDate }) => {
  const params = [];
  const where = [];
  if (fromDate) { params.push(fromDate); where.push(`issued_at >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`issued_at <= $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [agg, payments] = await Promise.all([
    query(
      `SELECT 
         SUM(CASE WHEN status='paid' THEN amount ELSE 0 END)::numeric AS paidAmount,
         SUM(CASE WHEN status='pending' THEN amount ELSE 0 END)::numeric AS pendingAmount,
         SUM(CASE WHEN status='overdue' THEN amount ELSE 0 END)::numeric AS overdueAmount,
         SUM(amount)::numeric AS totalAmount
       FROM fee_invoices ${whereSql}`,
      params
    ),
    query(
      `SELECT SUM(amount)::numeric AS paidTotal FROM fee_payments` // total paid overall
    ),
  ]);

  const a = agg.rows[0];
  const p = payments.rows[0];
  return {
    paidAmount: a.paidamount || 0,
    pendingAmount: a.pendingamount || 0,
    overdueAmount: a.overdueamount || 0,
    totalAmount: a.totalamount || 0,
    paidTotal: p.paidtotal || 0,
  };
};

export const getExamPerformance = async ({ examId }) => {
  const params = [];
  let where = '';
  if (examId) { params.push(examId); where = `WHERE er.exam_id = $1`; }
  const { rows } = await query(
    `SELECT er.exam_id AS "examId", er.subject, AVG(er.marks)::numeric(5,2) AS avgMarks
     FROM exam_results er ${where}
     GROUP BY er.exam_id, er.subject
     ORDER BY subject ASC`,
    params
  );
  return rows;
};
