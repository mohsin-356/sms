import { http } from '../http';

export const login = async ({ email, password }) => {
  return http.post('/auth/login', { email, password });
};

export const logout = async () => {
  return http.post('/auth/logout');
};

export const refresh = async () => {
  return http.post('/auth/refresh');
};

export const profile = async () => {
  return http.get('/auth/profile');
};
