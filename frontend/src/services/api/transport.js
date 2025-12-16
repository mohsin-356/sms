import { http } from '../http';

export const listBuses = () => http.get('/transport/buses');
export const createBus = (data) => http.post('/transport/buses', data);
export const updateBus = (id, data) => http.put(`/transport/buses/${id}`, data);

export const listRoutes = () => http.get('/transport/routes');
export const listRouteStops = (routeId) => http.get(`/transport/routes/${routeId}/stops`);
