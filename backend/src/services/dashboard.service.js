import { query } from '../config/db.js';

export const getOverview = async () => {
  const [studentsRes, teachersRes, busesRes, attendanceRes, alertsRes] = await Promise.all([
    query("SELECT COUNT(*)::int AS count FROM students WHERE status = 'active'"),
    query("SELECT COUNT(*)::int AS count FROM teachers WHERE status = 'active'"),
    query("SELECT COUNT(*)::int AS count FROM buses WHERE status = 'active'"),
    query(
      `SELECT status, COUNT(*)::int AS count
       FROM attendance_records
       WHERE date = CURRENT_DATE
       GROUP BY status`
    ),
    query(
      `SELECT id, message, severity, created_at
       FROM alerts
       ORDER BY created_at DESC
       LIMIT 5`
    ),
  ]);

  const totalStudents = studentsRes.rows[0]?.count || 0;
  const totalTeachers = teachersRes.rows[0]?.count || 0;
  const activeBuses = busesRes.rows[0]?.count || 0;

  // Compute today's attendance percentage based on records available for today
  const attMap = Object.fromEntries(attendanceRes.rows.map(r => [r.status, r.count]));
  const present = attMap.present || 0;
  const absent = attMap.absent || 0;
  const late = attMap.late || 0;
  const totalMarked = present + absent + late;
  const todayAttendance = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

  return {
    totalStudents,
    totalTeachers,
    activeBuses,
    todayAttendance,
    recentAlerts: alertsRes.rows,
  };
};

export default { getOverview };
