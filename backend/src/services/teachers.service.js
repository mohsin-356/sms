import { query } from '../config/db.js';

const teacherSelect = `
  id,
  name,
  email,
  phone,
  qualification,
  gender,
  dob,
  blood_group AS "bloodGroup",
  religion,
  national_id AS "nationalId",
  address_line1 AS "address1",
  address_line2 AS "address2",
  city,
  state,
  postal_code AS "postalCode",
  emergency_name AS "emergencyName",
  emergency_phone AS "emergencyPhone",
  emergency_relation AS "emergencyRelation",
  employment_type AS "employmentType",
  joining_date AS "joiningDate",
  employee_id AS "employeeId",
  department,
  designation,
  experience_years AS "experienceYears",
  specialization,
  subject,
  subjects,
  classes,
  employment_status AS "employmentStatus",
  status,
  probation_end_date AS "probationEndDate",
  contract_end_date AS "contractEndDate",
  work_hours_per_week AS "workHoursPerWeek",
  base_salary AS "baseSalary",
  allowances,
  deductions,
  salary,
  currency,
  pay_frequency AS "payFrequency",
  payment_method AS "paymentMethod",
  bank_name AS "bankName",
  account_number AS "accountNumber",
  iban,
  avatar,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const columnMap = {
  name: 'name',
  email: 'email',
  phone: 'phone',
  qualification: 'qualification',
  gender: 'gender',
  dob: 'dob',
  bloodGroup: 'blood_group',
  religion: 'religion',
  nationalId: 'national_id',
  address1: 'address_line1',
  address2: 'address_line2',
  city: 'city',
  state: 'state',
  postalCode: 'postal_code',
  emergencyName: 'emergency_name',
  emergencyPhone: 'emergency_phone',
  emergencyRelation: 'emergency_relation',
  employmentType: 'employment_type',
  joiningDate: 'joining_date',
  employeeId: 'employee_id',
  department: 'department',
  designation: 'designation',
  experienceYears: 'experience_years',
  specialization: 'specialization',
  subject: 'subject',
  subjects: 'subjects',
  classes: 'classes',
  employmentStatus: 'employment_status',
  status: 'status',
  probationEndDate: 'probation_end_date',
  contractEndDate: 'contract_end_date',
  workHoursPerWeek: 'work_hours_per_week',
  baseSalary: 'base_salary',
  allowances: 'allowances',
  deductions: 'deductions',
  salary: 'salary',
  currency: 'currency',
  payFrequency: 'pay_frequency',
  paymentMethod: 'payment_method',
  bankName: 'bank_name',
  accountNumber: 'account_number',
  iban: 'iban',
  avatar: 'avatar',
};

const jsonColumns = new Set(['subjects', 'classes']);
const netFields = ['baseSalary', 'allowances', 'deductions'];

const mapTeacherRow = (row = {}) => ({
  ...row,
  subjects: Array.isArray(row.subjects) ? row.subjects : [],
  classes: Array.isArray(row.classes) ? row.classes : [],
});

const computeNetSalary = ({ baseSalary = 0, allowances = 0, deductions = 0 }) => {
  const net = Number(baseSalary || 0) + Number(allowances || 0) - Number(deductions || 0);
  return Math.max(0, Number(net.toFixed(2)));
};

export const list = async ({ page = 1, pageSize = 50, q }) => {
  const offset = (page - 1) * pageSize;
  const params = [];
  const where = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR LOWER(employee_id) LIKE $${params.length})`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS count FROM teachers ${whereSql}`, params);
  const total = countRows[0]?.count || 0;

  const { rows } = await query(
    `SELECT ${teacherSelect} FROM teachers ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, pageSize, offset]
  );
  return { rows: rows.map(mapTeacherRow), total, page, pageSize };
};

export const getById = async (id) => {
  const { rows } = await query(`SELECT ${teacherSelect} FROM teachers WHERE id = $1`, [id]);
  return rows[0] ? mapTeacherRow(rows[0]) : null;
};

export const getSchedule = async (id) => {
  const { rows } = await query(
    'SELECT id, day_of_week AS "dayOfWeek", start_time AS "startTime", end_time AS "endTime", class, section, subject FROM teacher_schedules WHERE teacher_id = $1 ORDER BY day_of_week, start_time',
    [id]
  );
  return rows;
};

export const create = async (payload = {}) => {
  const data = { ...payload };
  data.employmentType = data.employmentType || 'fullTime';
  data.employmentStatus = data.employmentStatus || 'active';
  data.status = data.status || data.employmentStatus;
  data.currency = data.currency || 'PKR';
  data.payFrequency = data.payFrequency || 'monthly';
  data.paymentMethod = data.paymentMethod || 'bank';
  data.subjects = Array.isArray(data.subjects) ? data.subjects : [];
  data.classes = Array.isArray(data.classes) ? data.classes : [];
  data.baseSalary = data.baseSalary ?? 0;
  data.allowances = data.allowances ?? 0;
  data.deductions = data.deductions ?? 0;
  data.subject = data.subject || data.specialization || (data.subjects.length ? data.subjects[0] : null);
  data.salary = computeNetSalary(data);

  const insertFields = [
    // Personal & contact
    'name', 'email', 'phone', 'qualification', 'gender', 'dob', 'bloodGroup', 'religion', 'nationalId',
    'address1', 'address2', 'city', 'state', 'postalCode', 'emergencyName', 'emergencyPhone', 'emergencyRelation',
    // Professional
    'employmentType', 'joiningDate', 'employeeId', 'department', 'designation', 'experienceYears', 'specialization',
    'employmentStatus', 'status', 'probationEndDate', 'contractEndDate', 'workHoursPerWeek',
    // Teaching scope
    'subjects', 'classes', 'subject',
    // Compensation
    'baseSalary', 'allowances', 'deductions', 'salary',
    // Payment
    'currency', 'payFrequency', 'paymentMethod', 'bankName', 'accountNumber', 'iban',
    // Media
    'avatar',
  ];

  const columns = insertFields.map((field) => columnMap[field]);
  const values = insertFields.map((field) => {
    if (jsonColumns.has(field)) return JSON.stringify(data[field] ?? []);
    return data[field] ?? null;
  });
  const placeholders = columns.map((_, idx) => `$${idx + 1}`);

  const { rows } = await query(
    `INSERT INTO teachers (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING ${teacherSelect}`,
    values
  );
  return mapTeacherRow(rows[0]);
};

export const update = async (id, payload = {}) => {
  if (!payload || Object.keys(payload).length === 0) return await getById(id);

  const { rows } = await query('SELECT base_salary, allowances, deductions FROM teachers WHERE id = $1', [id]);
  if (!rows.length) return null;
  const current = rows[0];

  const data = { ...payload };
  if (data.employmentStatus && !data.status) data.status = data.employmentStatus;
  if (!data.subject && data.specialization) data.subject = data.specialization;
  if (!data.subject && Array.isArray(data.subjects) && data.subjects.length) data.subject = data.subjects[0];

  if (netFields.some((field) => field in data)) {
    const baseSalary = 'baseSalary' in data ? data.baseSalary : current.base_salary;
    const allowances = 'allowances' in data ? data.allowances : current.allowances;
    const deductions = 'deductions' in data ? data.deductions : current.deductions;
    data.salary = computeNetSalary({ baseSalary, allowances, deductions });
  }

  const sets = [];
  const values = [];
  Object.entries(data).forEach(([field, value]) => {
    if (!(field in columnMap)) return;
    const column = columnMap[field];
    const formattedValue = jsonColumns.has(field) ? JSON.stringify(value ?? []) : value;
    values.push(formattedValue);
    sets.push(`${column} = $${values.length}`);
  });

  if (!sets.length) return await getById(id);
  sets.push('updated_at = NOW()');
  values.push(id);

  const { rowCount } = await query(`UPDATE teachers SET ${sets.join(', ')} WHERE id = $${values.length}`, values);
  if (!rowCount) return null;
  return await getById(id);
};

export const remove = async (id) => {
  const { rowCount } = await query('DELETE FROM teachers WHERE id = $1', [id]);
  return rowCount > 0;
};
