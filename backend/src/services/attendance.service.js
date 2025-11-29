import { query } from '../config/db.js';

export const list = async ({ studentId, startDate, endDate, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];
  if (studentId) { params.push(studentId); where.push(`student_id = $${params.length}`); }
  if (startDate) { params.push(startDate); where.push(`date >= $${params.length}`); }
  if (endDate) { params.push(endDate); where.push(`date <= $${params.length}`); }
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(`SELECT id, student_id AS "studentId", date, status, remarks, created_by AS "createdBy", created_at AS "createdAt" FROM attendance_records ${whereSql} ORDER BY date DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
  return rows;
};

export const getById = async (id) => {
  const { rows } = await query('SELECT id, student_id AS "studentId", date, status, remarks, created_by AS "createdBy", created_at AS "createdAt" FROM attendance_records WHERE id = $1', [id]);
  return rows[0] || null;
};

export const create = async ({ studentId, date, status, remarks, createdBy }) => {
  const { rows } = await query(
    'INSERT INTO attendance_records (student_id, date, status, remarks, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id, student_id AS "studentId", date, status, remarks, created_by AS "createdBy", created_at AS "createdAt"',
    [studentId, date, status, remarks || null, createdBy || null]
  );
  return rows[0];
};

export const update = async (id, { status, remarks }) => {
  const { rows } = await query(
    'UPDATE attendance_records SET status = COALESCE($2,status), remarks = COALESCE($3,remarks) WHERE id = $1 RETURNING id, student_id AS "studentId", date, status, remarks, created_by AS "createdBy", created_at AS "createdAt"',
    [id, status || null, remarks || null]
  );
  return rows[0] || null;
};

export const remove = async (id) => {
  await query('DELETE FROM attendance_records WHERE id = $1', [id]);
  return true;
};
