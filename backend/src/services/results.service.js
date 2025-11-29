import { query } from '../config/db.js';

export const list = async ({ examId, studentId, subject, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];
  if (examId) { params.push(examId); where.push(`exam_id = $${params.length}`); }
  if (studentId) { params.push(studentId); where.push(`student_id = $${params.length}`); }
  if (subject) { params.push(subject); where.push(`subject = $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT id, exam_id AS "examId", student_id AS "studentId", subject, marks, grade
     FROM exam_results ${whereSql}
     ORDER BY id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const getById = async (id) => {
  const { rows } = await query(
    'SELECT id, exam_id AS "examId", student_id AS "studentId", subject, marks, grade FROM exam_results WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const create = async ({ examId, studentId, subject, marks, grade }) => {
  const { rows } = await query(
    'INSERT INTO exam_results (exam_id, student_id, subject, marks, grade) VALUES ($1,$2,$3,$4,$5) RETURNING id, exam_id AS "examId", student_id AS "studentId", subject, marks, grade',
    [examId, studentId, subject, marks || null, grade || null]
  );
  return rows[0];
};

export const update = async (id, { subject, marks, grade }) => {
  const { rows } = await query(
    'UPDATE exam_results SET subject = COALESCE($2,subject), marks = COALESCE($3,marks), grade = COALESCE($4,grade) WHERE id = $1 RETURNING id, exam_id AS "examId", student_id AS "studentId", subject, marks, grade',
    [id, subject || null, marks || null, grade || null]
  );
  return rows[0] || null;
};

export const remove = async (id) => {
  await query('DELETE FROM exam_results WHERE id = $1', [id]);
  return true;
};
