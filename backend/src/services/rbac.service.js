import { query } from '../config/db.js';
import * as settings from './settings.service.js';

const FIXED_ROLES = ['admin','teacher','student','driver'];
const ALL_PERMS = [
  'students.view','students.edit',
  'teachers.view','teachers.edit',
  'finance.view','finance.edit',
  'transport.view','transport.edit',
  'attendance.view','attendance.edit','attendance.export',
  'reports.view','reports.export',
  'communication.send',
  'settings.manage'
];

export const listRoles = async () => {
  const { rows } = await query('SELECT role, COUNT(*)::int AS count FROM users GROUP BY role');
  const counts = Object.fromEntries(rows.map(r => [r.role, r.count]));
  const items = [];
  for (const r of FIXED_ROLES) {
    const activeKey = `role.active.${r}`;
    const activeItem = await settings.getByKey(activeKey);
    const active = activeItem ? activeItem.value === 'true' : true;
    items.push({ id: r, name: r.charAt(0).toUpperCase() + r.slice(1), users: counts[r] || 0, active });
  }
  return items;
};

export const setRoleActive = async (role, active) => {
  if (!FIXED_ROLES.includes(role)) throw new Error('Invalid role');
  const key = `role.active.${role}`;
  const v = active ? 'true' : 'false';
  return settings.setKey(key, v);
};

export const listPermissions = async () => {
  const assignments = {};
  for (const r of FIXED_ROLES) {
    const key = `perms.${r}`;
    const item = await settings.getByKey(key);
    try {
      assignments[r] = item ? JSON.parse(item.value) : [];
    } catch (_) {
      assignments[r] = [];
    }
  }
  return { roles: FIXED_ROLES, allPerms: ALL_PERMS, assignments };
};

export const setPermissionsForRole = async (role, perms = []) => {
  if (!FIXED_ROLES.includes(role)) throw new Error('Invalid role');
  const valid = perms.filter(p => ALL_PERMS.includes(p));
  const key = `perms.${role}`;
  return settings.setKey(key, JSON.stringify(valid));
};
