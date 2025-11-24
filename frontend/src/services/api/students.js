import { http } from '../http';

export const list = (params) => http.get('/students', { params });
export const getById = (id) => http.get(`/students/${id}`);
export const create = (data) => http.post('/students', data);
export const update = (id, data) => http.put(`/students/${id}`, data);
export const remove = (id) => http.delete(`/students/${id}`);
