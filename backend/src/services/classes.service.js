import { query } from '../config/db.js';

const selectColumns = `
  cs.id,
  cs.class_name AS "className",
  cs.section,
  cs.academic_year AS "academicYear",
  cs.class_teacher_id AS "classTeacherId",
  cs.capacity,
  cs.enrolled_students AS "enrolledStudents",
  cs.room,
  cs.medium,
  cs.shift,
  cs.status,
  cs.notes,
  cs.created_at AS "createdAt",
  cs.updated_at AS "updatedAt",
  t.name AS "classTeacherName",
  t.employee_id AS "classTeacherEmployeeId",
  t.email AS "classTeacherEmail"
`;

const columnMap = {
  className: 'class_name',
  section: 'section',
  academicYear: 'academic_year',
  classTeacherId: 'class_teacher_id',
  capacity: 'capacity',
  enrolledStudents: 'enrolled_students',
  room: 'room',
  medium: 'medium',
  shift: 'shift',
  status: 'status',
  notes: 'notes',
};

const mapRow = (row = {}) => {
  if (!row) return null;
  const strength = Number(row.enrolledStudents ?? 0);
  const capacity = Number(row.capacity ?? 0);
  const availableSeats = Number.isFinite(capacity) && Number.isFinite(strength)
    ? Math.max(capacity - strength, 0)
    : null;

  return {
    ...row,
    strength,
    availableSeats,
    isFull: Number.isFinite(capacity) && Number.isFinite(strength) ? strength >= capacity : false,
  };
};

const mapPayloadToDb = (payload = {}) => {
  const data = {};

  Object.entries(columnMap).forEach(([key, column]) => {
    if (payload[key] !== undefined) data[column] = payload[key];
  });

  if (payload.strength !== undefined && data.enrolled_students === undefined) {
    data.enrolled_students = payload.strength;
  }

  return data;
};

export const list = async ({
  page = 1,
  pageSize = 50,
  search,
  className,
  section,
  academicYear,
  status,
  teacherId,
} = {}) => {
  const where = [];
  const params = [];

  if (className) {
    params.push(className.trim());
    where.push(`cs.class_name = $${params.length}`);
  }

  if (section) {
    params.push(section.trim());
    where.push(`cs.section = $${params.length}`);
  }

  if (academicYear) {
    params.push(academicYear.trim());
    where.push(`cs.academic_year = $${params.length}`);
  }

  if (status) {
    params.push(status.trim());
    where.push(`cs.status = $${params.length}`);
  }

  if (teacherId) {
    params.push(Number(teacherId));
    where.push(`cs.class_teacher_id = $${params.length}`);
  }

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    where.push(`(
      LOWER(cs.class_name) LIKE $${params.length} OR
      LOWER(cs.section) LIKE $${params.length} OR
      LOWER(COALESCE(t.name, '')) LIKE $${params.length}
    )`);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;

  const { rows: countRows } = await query(
    `SELECT COUNT(*)::int AS count
       FROM class_sections cs
       LEFT JOIN teachers t ON t.id = cs.class_teacher_id
       ${whereSql}`,
    params
  );
  const total = countRows[0]?.count || 0;

  const dataParams = [...params, pageSize, offset];
  const { rows } = await query(
    `SELECT ${selectColumns}
       FROM class_sections cs
       LEFT JOIN teachers t ON t.id = cs.class_teacher_id
       ${whereSql}
       ORDER BY cs.class_name, cs.section
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );

  return {
    rows: rows.map(mapRow),
    total,
    page,
    pageSize,
  };
};

export const getById = async (id) => {
  const { rows } = await query(
    `SELECT ${selectColumns}
       FROM class_sections cs
       LEFT JOIN teachers t ON t.id = cs.class_teacher_id
      WHERE cs.id = $1`,
    [id]
  );
  return rows[0] ? mapRow(rows[0]) : null;
};

export const create = async (payload = {}) => {
  const data = mapPayloadToDb(payload);
  if (data.enrolled_students === undefined) data.enrolled_students = 0;

  const columns = Object.keys(data);
  const values = Object.values(data);

  if (!columns.length) {
    throw new Error('No valid fields provided for class creation');
  }

  const placeholders = columns.map((_, idx) => `$${idx + 1}`);

  const { rows } = await query(
    `INSERT INTO class_sections (${columns.join(',')})
     VALUES (${placeholders.join(',')})
     RETURNING id`,
    values
  );

  return getById(rows[0].id);
};

export const update = async (id, payload = {}) => {
  const data = mapPayloadToDb(payload);
  if (!Object.keys(data).length) {
    return getById(id);
  }

  const sets = Object.entries(data).map(([column, value], idx) => ({
    sql: `${column} = $${idx + 1}`,
    value,
  }));

  const params = sets.map((item) => item.value);
  params.push(id);

  const setSql = sets.map((item) => item.sql).join(', ');

  const { rowCount } = await query(
    `UPDATE class_sections
        SET ${setSql}, updated_at = NOW()
      WHERE id = $${params.length}`,
    params
  );

  if (!rowCount) return null;
  return getById(id);
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM class_sections WHERE id = $1', [id]);
  return rowCount > 0;
};
