import { http } from '../http';

export const list = (params) => http.get('/teachers', { params });
export const getById = (id) => http.get(`/teachers/${id}`);
export const create = (data) => http.post('/teachers', data);
export const update = (id, data) => http.put(`/teachers/${id}`, data);
export const remove = (id) => http.delete(`/teachers/${id}`);
export const getSchedule = (id, params) => http.get(`/teachers/${id}/schedule`, { params });
