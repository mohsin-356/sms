import { query } from '../config/db.js';

export const list = async () => {
  const { rows } = await query('SELECT key, value, updated_at AS "updatedAt" FROM settings ORDER BY key ASC');
  return rows;
};

export const getByKey = async (key) => {
  const { rows } = await query('SELECT key, value, updated_at AS "updatedAt" FROM settings WHERE key = $1', [key]);
  return rows[0] || null;
};

export const setKey = async (key, value) => {
  const { rows } = await query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1,$2,NOW())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
     RETURNING key, value, updated_at AS "updatedAt"`,
    [key, String(value)]
  );
  return rows[0];
};

export const removeKey = async (key) => {
  await query('DELETE FROM settings WHERE key = $1', [key]);
  return true;
};
