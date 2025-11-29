import { query } from '../config/db.js';

export const listExams = async ({ q, className, section, fromDate, toDate, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];
  if (q) { params.push(`%${q}%`); where.push(`title ILIKE $${params.length}`); }
  if (className) { params.push(className); where.push(`class = $${params.length}`); }
  if (section) { params.push(section); where.push(`section = $${params.length}`); }
  if (fromDate) { params.push(fromDate); where.push(`exam_date >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`exam_date <= $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT id, title, exam_date AS "examDate", class, section FROM exams ${whereSql} ORDER BY exam_date DESC NULLS LAST, id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const getExamById = async (id) => {
  const { rows } = await query('SELECT id, title, exam_date AS "examDate", class, section FROM exams WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createExam = async ({ title, examDate, className, section }) => {
  const { rows } = await query(
    'INSERT INTO exams (title, exam_date, class, section) VALUES ($1,$2,$3,$4) RETURNING id, title, exam_date AS "examDate", class, section',
    [title, examDate || null, className || null, section || null]
  );
  return rows[0];
};

export const updateExam = async (id, { title, examDate, className, section }) => {
  const { rows } = await query(
    'UPDATE exams SET title = COALESCE($2,title), exam_date = COALESCE($3,exam_date), class = COALESCE($4,class), section = COALESCE($5,section) WHERE id = $1 RETURNING id, title, exam_date AS "examDate", class, section',
    [id, title || null, examDate || null, className || null, section || null]
  );
  return rows[0] || null;
};

export const deleteExam = async (id) => {
  await query('DELETE FROM exams WHERE id = $1', [id]);
  return true;
};
