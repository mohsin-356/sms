import { http } from '../http';

export const list = (params) => http.get('/attendance', { params });
export const getById = (id) => http.get(`/attendance/${id}`);
export const create = (data) => http.post('/attendance', data);
export const update = (id, data) => http.put(`/attendance/${id}`, data);
export const remove = (id) => http.delete(`/attendance/${id}`);
