import { query } from '../config/db.js';

// Buses
export const listBuses = async () => {
  const { rows } = await query('SELECT id, number, driver_name AS "driverName", status FROM buses ORDER BY number ASC');
  return rows;
};

export const getBusById = async (id) => {
  const { rows } = await query('SELECT id, number, driver_name AS "driverName", status FROM buses WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createBus = async ({ number, driverName, status }) => {
  const { rows } = await query(
    'INSERT INTO buses (number, driver_name, status) VALUES ($1,$2,$3) RETURNING id, number, driver_name AS "driverName", status',
    [number, driverName || null, status || 'active']
  );
  return rows[0];
};

export const updateBus = async (id, { number, driverName, status }) => {
  const { rows } = await query(
    'UPDATE buses SET number = COALESCE($2,number), driver_name = COALESCE($3,driver_name), status = COALESCE($4,status) WHERE id = $1 RETURNING id, number, driver_name AS "driverName", status',
    [id, number || null, driverName || null, status || null]
  );
  return rows[0] || null;
};

export const deleteBus = async (id) => {
  await query('DELETE FROM buses WHERE id = $1', [id]);
  return true;
};

// Routes
export const listRoutes = async () => {
  const { rows } = await query('SELECT id, name FROM routes ORDER BY name ASC');
  return rows;
};

export const getRouteById = async (id) => {
  const { rows } = await query('SELECT id, name FROM routes WHERE id = $1', [id]);
  return rows[0] || null;
};

export const createRoute = async ({ name }) => {
  const { rows } = await query('INSERT INTO routes (name) VALUES ($1) RETURNING id, name', [name]);
  return rows[0];
};

export const updateRoute = async (id, { name }) => {
  const { rows } = await query('UPDATE routes SET name = COALESCE($2,name) WHERE id = $1 RETURNING id, name', [id, name || null]);
  return rows[0] || null;
};

export const deleteRoute = async (id) => {
  await query('DELETE FROM routes WHERE id = $1', [id]);
  return true;
};

// Route stops
export const listStops = async (routeId) => {
  const { rows } = await query(
    'SELECT id, route_id AS "routeId", name, latitude, longitude, sequence FROM route_stops WHERE route_id = $1 ORDER BY sequence ASC',
    [routeId]
  );
  return rows;
};

export const addStop = async (routeId, { name, latitude, longitude, sequence }) => {
  const { rows } = await query(
    'INSERT INTO route_stops (route_id, name, latitude, longitude, sequence) VALUES ($1,$2,$3,$4,$5) RETURNING id, route_id AS "routeId", name, latitude, longitude, sequence',
    [routeId, name, latitude || null, longitude || null, sequence || 1]
  );
  return rows[0];
};

export const updateStop = async (routeId, stopId, { name, latitude, longitude, sequence }) => {
  const { rows } = await query(
    'UPDATE route_stops SET name = COALESCE($3,name), latitude = COALESCE($4,latitude), longitude = COALESCE($5,longitude), sequence = COALESCE($6,sequence) WHERE id = $2 AND route_id = $1 RETURNING id, route_id AS "routeId", name, latitude, longitude, sequence',
    [routeId, stopId, name || null, latitude || null, longitude || null, sequence || null]
  );
  return rows[0] || null;
};

export const removeStop = async (routeId, stopId) => {
  await query('DELETE FROM route_stops WHERE id = $1 AND route_id = $2', [stopId, routeId]);
  return true;
};

// Assign bus to route
export const assignBusToRoute = async (busId, routeId) => {
  const { rows } = await query(
    'INSERT INTO bus_assignments (bus_id, route_id) VALUES ($1,$2) ON CONFLICT (bus_id) DO UPDATE SET route_id = EXCLUDED.route_id RETURNING id, bus_id AS "busId", route_id AS "routeId", assigned_at AS "assignedAt"',
    [busId, routeId]
  );
  return rows[0];
};

// Student transport
export const getStudentTransport = async (studentId) => {
  const { rows } = await query(
    'SELECT id, student_id AS "studentId", route_id AS "routeId", bus_id AS "busId", pickup_stop_id AS "pickupStopId", drop_stop_id AS "dropStopId" FROM student_transport WHERE student_id = $1',
    [studentId]
  );
  return rows[0] || null;
};

export const setStudentTransport = async (studentId, { routeId, busId, pickupStopId, dropStopId }) => {
  const { rows } = await query(
    `INSERT INTO student_transport (student_id, route_id, bus_id, pickup_stop_id, drop_stop_id)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (student_id) DO UPDATE SET route_id = EXCLUDED.route_id, bus_id = EXCLUDED.bus_id, pickup_stop_id = EXCLUDED.pickup_stop_id, drop_stop_id = EXCLUDED.drop_stop_id
     RETURNING id, student_id AS "studentId", route_id AS "routeId", bus_id AS "busId", pickup_stop_id AS "pickupStopId", drop_stop_id AS "dropStopId"`,
    [studentId, routeId || null, busId || null, pickupStopId || null, dropStopId || null]
  );
  return rows[0];
};
