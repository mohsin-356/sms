import * as rbac from '../services/rbac.service.js';

export const listRoles = async (req, res, next) => {
  try {
    const items = await rbac.listRoles();
    res.json({ items });
  } catch (e) { next(e); }
};

export const setRoleActive = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toLowerCase();
    const { active } = req.body;
    const item = await rbac.setRoleActive(role, Boolean(active));
    res.json(item);
  } catch (e) { next(e); }
};

export const listPermissions = async (req, res, next) => {
  try {
    const data = await rbac.listPermissions();
    res.json(data);
  } catch (e) { next(e); }
};

export const setPermissionsForRole = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toLowerCase();
    const perms = Array.isArray(req.body.perms) ? req.body.perms : [];
    const item = await rbac.setPermissionsForRole(role, perms);
    res.json(item);
  } catch (e) { next(e); }
};
