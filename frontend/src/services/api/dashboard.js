import { http } from '../http';

// Admin dashboard overview (students, teachers, buses, attendance, alerts)
export const getOverview = () => http.get('/dashboard/overview');
