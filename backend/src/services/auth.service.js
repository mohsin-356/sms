import { query } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const findUserByEmail = async (email) => {
  const { rows } = await query('SELECT id, email, password_hash, role, name FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await query('SELECT id, email, role, name FROM users WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createUser = async ({ email, passwordHash, role = 'student', name }) => {
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id, email, role, name',
    [email, passwordHash, role, name || email]
  );
  return rows[0];
};

export const listUsers = async () => {
  const { rows } = await query('SELECT id, email, role, name FROM users ORDER BY id ASC');
  return rows;
};

export const backfillUsersFromDomain = async (role) => {
  let domainSql;
  if (role === 'teacher') {
    domainSql = `SELECT name, email FROM teachers WHERE email IS NOT NULL AND email <> ''
                 AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(teachers.email))`;
  } else if (role === 'student') {
    domainSql = `SELECT name, email FROM students WHERE email IS NOT NULL AND email <> ''
                 AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(students.email))`;
  } else if (role === 'driver') {
    domainSql = `SELECT name, email FROM drivers WHERE email IS NOT NULL AND email <> ''
                 AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(drivers.email))`;
  } else {
    return { created: 0, items: [] };
  }

  const { rows } = await query(domainSql);
  if (!rows.length) return { created: 0, items: [] };

  const tempPass = Math.random().toString(36).slice(2) + 'A!9';
  const passwordHash = await bcrypt.hash(tempPass, 10);

  const created = [];
  for (const r of rows) {
    const name = r.name || r.email;
    const email = r.email;
    const { rows: ins } = await query(
      'INSERT INTO users (email, password_hash, role, name) VALUES ($1,$2,$3,$4) RETURNING id, email, role, name',
      [email, passwordHash, role, name]
    );
    if (ins[0]) created.push(ins[0]);
  }

  return { created: created.length, items: created };
};
