import { http } from '../http';

export const login = async ({ email, password, ownerKey }) => {
  const payload = { email, password };
  if (ownerKey) payload.ownerKey = ownerKey;
  return http.post('/auth/login', payload);
};

export const register = async ({ email, password, name, role }) => {
  return http.post('/auth/register', { email, password, name, role });
};

export const status = async () => {
  return http.get('/auth/status');
};

export const logout = async () => {
  return http.post('/auth/logout');
};

export const refresh = async () => {
  return http.post('/auth/refresh');
};

// Admin only: list all users with roles
export const getUsers = async () => {
  return http.get('/auth/users');
};

export const profile = async () => {
  return http.get('/auth/profile');
};

// Admin only: backfill user accounts from domain tables by role
export const backfillUsers = async ({ role }) => {
  return http.post('/auth/backfill-users', { role });
};
