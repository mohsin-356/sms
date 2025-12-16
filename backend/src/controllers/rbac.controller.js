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

// Module-level access APIs
export const listModules = async (req, res, next) => {
  try {
    const data = await rbac.listModuleAssignments();
    res.json(data);
  } catch (e) { next(e); }
};

export const setModulesForRole = async (req, res, next) => {
  try {
    const role = String(req.params.role || '').toLowerCase();
    const allowModules = Array.isArray(req.body.allowModules) ? req.body.allowModules : [];
    const allowSubroutes = Array.isArray(req.body.allowSubroutes) ? req.body.allowSubroutes : [];
    const item = await rbac.setModulesForRole(role, { allowModules, allowSubroutes });
    res.json(item);
  } catch (e) { next(e); }
};

export const getMyModules = async (req, res, next) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (!role) return res.status(400).json({ message: 'No role' });
    const data = await rbac.listModuleAssignments();
    const item = data?.assignments?.[role] || { allowModules: [], allowSubroutes: [] };
    res.json(item);
  } catch (e) { next(e); }
};
