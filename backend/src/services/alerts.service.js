import { query } from '../config/db.js';

export const list = async ({ severity, status, q, fromDate, toDate, targetUserId, page = 1, pageSize = 50 }) => {
  const params = [];
  const where = [];
  if (severity) { params.push(severity); where.push(`severity = $${params.length}`); }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (targetUserId) { params.push(Number(targetUserId)); where.push(`target_user_id = $${params.length}`); }
  if (fromDate) { params.push(fromDate); where.push(`created_at::date >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`created_at::date <= $${params.length}`); }
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(message) LIKE $${params.length} OR LOWER(type) LIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT id, message, severity, status, type, is_read AS "isRead", target_user_id AS "targetUserId", created_by AS "createdBy", created_at AS "createdAt"
     FROM alerts ${whereSql}
     ORDER BY created_at DESC, id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};

export const listRecipients = async ({ role, q }) => {
  const params = [];
  let sql;
  const like = q ? `%${String(q).toLowerCase()}%` : null;

  if (role === 'student') {
    sql = `
      SELECT u.id, COALESCE(s.name, u.name) AS name, u.email, u.role
      FROM users u
      JOIN students s ON LOWER(s.email) = LOWER(u.email)
      WHERE u.role = 'student'
    `;
    if (like) { params.push(like); sql += ` AND (LOWER(COALESCE(s.name,u.name)) LIKE $1 OR LOWER(u.email) LIKE $1)`; }
    sql += ' ORDER BY COALESCE(s.name, u.name)';
  } else if (role === 'teacher') {
    sql = `
      SELECT u.id, COALESCE(t.name, u.name) AS name, u.email, u.role
      FROM users u
      JOIN teachers t ON LOWER(t.email) = LOWER(u.email)
      WHERE u.role = 'teacher'
    `;
    if (like) { params.push(like); sql += ` AND (LOWER(COALESCE(t.name,u.name)) LIKE $1 OR LOWER(u.email) LIKE $1)`; }
    sql += ' ORDER BY COALESCE(t.name, u.name)';
  } else if (role === 'driver') {
    sql = `
      SELECT u.id, COALESCE(d.name, u.name) AS name, u.email, u.role
      FROM users u
      JOIN drivers d ON LOWER(d.email) = LOWER(u.email)
      WHERE u.role = 'driver'
    `;
    if (like) { params.push(like); sql += ` AND (LOWER(COALESCE(d.name,u.name)) LIKE $1 OR LOWER(u.email) LIKE $1)`; }
    sql += ' ORDER BY COALESCE(d.name, u.name)';
  } else {
    return [];
  }

  const { rows } = await query(sql, params);
  return rows;
};

export const create = async ({ message, severity = 'info', type, targetUserId, createdBy }) => {
  const { rows } = await query(
    `INSERT INTO alerts (message, severity, type, target_user_id, created_by)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, message, severity, status, type, is_read AS "isRead", target_user_id AS "targetUserId", created_by AS "createdBy", created_at AS "createdAt"`,
    [message, severity, type || null, targetUserId || null, createdBy || null]
  );
  return rows[0];
};

export const markRead = async (ids = []) => {
  if (!ids.length) return { updated: 0 };
  const params = ids.map((_, i) => `$${i + 1}`).join(', ');
  const { rowCount } = await query(`UPDATE alerts SET is_read = TRUE WHERE id IN (${params})`, ids);
  return { updated: rowCount };
};

export const resolve = async (ids = []) => {
  if (!ids.length) return { updated: 0 };
  const params = ids.map((_, i) => `$${i + 1}`).join(', ');
  const { rowCount } = await query(`UPDATE alerts SET status = 'resolved' WHERE id IN (${params})`, ids);
  return { updated: rowCount };
};

export const listMine = async ({ userId, severity, status, fromDate, toDate, page = 1, pageSize = 50 }) => {
  const params = [Number(userId)];
  const where = ['target_user_id = $1'];
  if (severity) { params.push(severity); where.push(`severity = $${params.length}`); }
  if (status) { params.push(status); where.push(`status = $${params.length}`); }
  if (fromDate) { params.push(fromDate); where.push(`created_at::date >= $${params.length}`); }
  if (toDate) { params.push(toDate); where.push(`created_at::date <= $${params.length}`); }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const offset = (Number(page) - 1) * Number(pageSize);
  params.push(pageSize, offset);
  const { rows } = await query(
    `SELECT id, message, severity, status, type, is_read AS "isRead", target_user_id AS "targetUserId", created_by AS "createdBy", created_at AS "createdAt"
     FROM alerts ${whereSql}
     ORDER BY created_at DESC, id DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
};
