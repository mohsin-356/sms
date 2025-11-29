import { query } from '../config/db.js';

export const list = async ({ page = 1, pageSize = 50, q, class: cls, section }) => {
  const offset = (page - 1) * pageSize;
  const where = [];
  const params = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(roll_number) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(rfid_tag) LIKE $${params.length})`);
  }
  if (cls) {
    params.push(cls);
    where.push(`class = $${params.length}`);
  }
  if (section) {
    params.push(section);
    where.push(`section = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*)::int AS count FROM students ${whereSql}`;
  const { rows: countRows } = await query(countSql, params);
  const total = countRows[0]?.count || 0;

  const dataSql = `SELECT id, name, email, roll_number AS "rollNumber", class, section, rfid_tag AS "rfidTag", attendance, fee_status AS "feeStatus", bus_number AS "busNumber", bus_assigned AS "busAssigned", parent_name AS "parentName", parent_phone AS "parentPhone", status, admission_date AS "admissionDate", avatar FROM students ${whereSql} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const { rows } = await query(dataSql, [...params, pageSize, offset]);
  return { rows, total, page, pageSize };
};

export const getById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, roll_number AS "rollNumber", class, section, rfid_tag AS "rfidTag", attendance, fee_status AS "feeStatus", bus_number AS "busNumber", bus_assigned AS "busAssigned", parent_name AS "parentName", parent_phone AS "parentPhone", status, admission_date AS "admissionDate", avatar FROM students WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    name, email, rollNumber, class: cls, section, rfidTag, attendance, feeStatus,
    busNumber, busAssigned, parentName, parentPhone, status = 'active', admissionDate, avatar
  } = data;
  const { rows } = await query(
    `INSERT INTO students (name, email, roll_number, class, section, rfid_tag, attendance, fee_status, bus_number, bus_assigned, parent_name, parent_phone, status, admission_date, avatar)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING id, name, email, roll_number AS "rollNumber", class, section, rfid_tag AS "rfidTag", attendance, fee_status AS "feeStatus", bus_number AS "busNumber", bus_assigned AS "busAssigned", parent_name AS "parentName", parent_phone AS "parentPhone", status, admission_date AS "admissionDate", avatar`,
    [name, email || null, rollNumber || null, cls || null, section || null, rfidTag || null, attendance || 0, feeStatus || 'paid', busNumber || null, busAssigned ?? false, parentName || null, parentPhone || null, status, admissionDate || new Date(), avatar || null]
  );
  return rows[0];
};

export const update = async (id, data) => {
  const fields = [];
  const values = [];
  const map = {
    name: 'name', email: 'email', rollNumber: 'roll_number', class: 'class', section: 'section', rfidTag: 'rfid_tag', attendance: 'attendance', feeStatus: 'fee_status', busNumber: 'bus_number', busAssigned: 'bus_assigned', parentName: 'parent_name', parentPhone: 'parent_phone', status: 'status', admissionDate: 'admission_date', avatar: 'avatar'
  };
  Object.entries(data || {}).forEach(([k, v]) => {
    if (map[k] !== undefined) {
      values.push(v);
      fields.push(`${map[k]} = $${values.length}`);
    }
  });
  if (!fields.length) return await getById(id);
  values.push(id);
  const { rowCount } = await query(`UPDATE students SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
  if (!rowCount) return null;
  return await getById(id);
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM students WHERE id = $1', [id]);
  return rowCount > 0;
};

export const listAttendance = async (studentId, { startDate, endDate, page = 1, pageSize = 50 }) => {
  const offset = (page - 1) * pageSize;
  const where = ['student_id = $1'];
  const params = [studentId];
  if (startDate) { params.push(startDate); where.push(`date >= $${params.length}`); }
  if (endDate) { params.push(endDate); where.push(`date <= $${params.length}`); }
  const whereSql = `WHERE ${where.join(' AND ')}`;
  const countRes = await query(`SELECT COUNT(*)::int AS count FROM attendance_records ${whereSql}`, params);
  const total = countRes.rows[0]?.count || 0;
  const dataRes = await query(
    `SELECT id, student_id AS "studentId", date, status, remarks, created_at AS "createdAt" 
     FROM attendance_records ${whereSql} 
     ORDER BY date DESC, id DESC 
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows: dataRes.rows, total, page, pageSize };
};

export const addAttendance = async (studentId, { date, status, remarks }) => {
  const { rows } = await query(
    `INSERT INTO attendance_records (student_id, date, status, remarks)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status, remarks = EXCLUDED.remarks
     RETURNING id, student_id AS "studentId", date, status, remarks, created_at AS "createdAt"`,
    [studentId, date, status, remarks || null]
  );
  return rows[0];
};

export const updateAttendance = async (id, { status, remarks }) => {
  const { rowCount } = await query('UPDATE attendance_records SET status = COALESCE($1,status), remarks = COALESCE($2,remarks) WHERE id = $3', [status || null, remarks || null, id]);
  if (!rowCount) return null;
  const { rows } = await query('SELECT id, student_id AS "studentId", date, status, remarks, created_at AS "createdAt" FROM attendance_records WHERE id = $1', [id]);
  return rows[0] || null;
};

export const removeAttendance = async (id) => {
  const { rowCount } = await query('DELETE FROM attendance_records WHERE id = $1', [id]);
  return rowCount > 0;
};

export const getPerformance = async (studentId) => {
  const [avgRes, subjRes, recentRes, totalExamsRes] = await Promise.all([
    query('SELECT COALESCE(AVG(marks),0)::float AS avg FROM exam_results WHERE student_id = $1', [studentId]),
    query('SELECT subject, COALESCE(AVG(marks),0)::float AS avg, COUNT(*)::int AS count FROM exam_results WHERE student_id = $1 GROUP BY subject ORDER BY subject', [studentId]),
    query(`SELECT er.id, er.exam_id AS "examId", er.subject, er.marks, er.grade, e.title, e.exam_date AS "examDate"
           FROM exam_results er LEFT JOIN exams e ON e.id = er.exam_id
           WHERE er.student_id = $1
           ORDER BY e.exam_date DESC NULLS LAST, er.id DESC
           LIMIT 10`, [studentId]),
    query('SELECT COUNT(DISTINCT exam_id)::int AS total FROM exam_results WHERE student_id = $1', [studentId]),
  ]);
  return {
    average: avgRes.rows[0]?.avg || 0,
    totalExams: totalExamsRes.rows[0]?.total || 0,
    subjects: subjRes.rows,
    recentResults: recentRes.rows,
  };
};

export const getFees = async (studentId) => {
  const { rows: invoices } = await query(
    `SELECT fi.id, fi.amount::float, fi.status, fi.due_date AS "dueDate", fi.issued_at AS "issuedAt",
            COALESCE(SUM(fp.amount),0)::float AS paid
     FROM fee_invoices fi
     LEFT JOIN fee_payments fp ON fi.id = fp.invoice_id
     WHERE fi.student_id = $1
     GROUP BY fi.id
     ORDER BY fi.issued_at DESC`,
    [studentId]
  );
  let totalInvoiced = 0, totalPaid = 0, totalOutstanding = 0;
  invoices.forEach(inv => {
    totalInvoiced += inv.amount;
    totalPaid += inv.paid;
    const outstanding = Math.max(inv.amount - inv.paid, 0);
    totalOutstanding += outstanding;
    inv.outstanding = outstanding;
  });
  return { invoices, totals: { totalInvoiced, totalPaid, totalOutstanding } };
};

export const recordPayment = async (studentId, { invoiceId, amount, method }) => {
  const { rows: invRows } = await query('SELECT id FROM fee_invoices WHERE id = $1 AND student_id = $2', [invoiceId, studentId]);
  if (!invRows[0]) return null;
  const { rows } = await query(
    'INSERT INTO fee_payments (invoice_id, amount, method) VALUES ($1,$2,$3) RETURNING id, invoice_id AS "invoiceId", amount::float, method, paid_at AS "paidAt"',
    [invoiceId, amount, method || null]
  );
  return rows[0];
};

export const getTransport = async (studentId) => {
  const { rows } = await query(
    `SELECT st.id, st.student_id AS "studentId", st.route_id AS "routeId", r.name AS "routeName",
            st.bus_id AS "busId", b.number AS "busNumber",
            st.pickup_stop_id AS "pickupStopId", ps.name AS "pickupStopName",
            st.drop_stop_id AS "dropStopId", ds.name AS "dropStopName"
     FROM student_transport st
     LEFT JOIN routes r ON r.id = st.route_id
     LEFT JOIN buses b ON b.id = st.bus_id
     LEFT JOIN route_stops ps ON ps.id = st.pickup_stop_id
     LEFT JOIN route_stops ds ON ds.id = st.drop_stop_id
     WHERE st.student_id = $1`,
    [studentId]
  );
  return rows[0] || null;
};

export const updateTransport = async (studentId, { routeId, busId, pickupStopId, dropStopId }) => {
  const { rows: existing } = await query('SELECT id FROM student_transport WHERE student_id = $1', [studentId]);
  if (existing[0]) {
    await query('UPDATE student_transport SET route_id = $1, bus_id = $2, pickup_stop_id = $3, drop_stop_id = $4 WHERE student_id = $5', [routeId || null, busId || null, pickupStopId || null, dropStopId || null, studentId]);
  } else {
    await query('INSERT INTO student_transport (student_id, route_id, bus_id, pickup_stop_id, drop_stop_id) VALUES ($1,$2,$3,$4,$5)', [studentId, routeId || null, busId || null, pickupStopId || null, dropStopId || null]);
  }
  return await getTransport(studentId);
};
