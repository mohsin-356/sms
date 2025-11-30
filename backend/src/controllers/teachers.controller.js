import * as teachers from '../services/teachers.service.js';

const coerceString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = typeof value === 'string' ? value.trim() : String(value).trim();
  return str.length ? str : null;
};

const coerceNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const coerceDate = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const str = typeof value === 'string' ? value.trim() : String(value).trim();
  return str.length ? str : null;
};

const coerceArray = (value, partial) => {
  if (value === undefined) return partial ? undefined : [];

  let arr = [];
  if (Array.isArray(value)) {
    arr = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return partial ? undefined : [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) arr = parsed;
      } catch {
        arr = trimmed.split(',');
      }
    } else {
      arr = trimmed.split(',');
    }
  }

  const cleaned = arr.map((entry) => coerceString(entry)).filter((entry) => entry);
  return cleaned;
};

const normalizeTeacherPayload = (raw = {}, { partial = false } = {}) => {
  const data = {};

  const assignString = (field, source = field) => {
    const value = coerceString(raw[source]);
    if (value !== undefined) data[field] = value;
  };

  const assignNumber = (field) => {
    const value = coerceNumber(raw[field]);
    if (value !== undefined) data[field] = value;
  };

  const assignDate = (field) => {
    const value = coerceDate(raw[field]);
    if (value !== undefined) data[field] = value;
  };

  const assignArray = (field) => {
    const value = coerceArray(raw[field], partial);
    if (value !== undefined) data[field] = Array.from(new Set(value));
  };

  assignString('name');
  assignString('email');
  assignString('phone');
  assignString('qualification');
  assignString('employmentType');
  assignString('employeeId');
  assignString('department');
  assignString('designation');
  assignNumber('experienceYears');
  assignString('specialization');
  assignString('employmentStatus');
  assignString('currency');
  assignString('payFrequency');
  assignString('paymentMethod');
  assignString('bankName');
  assignString('accountNumber');
  assignString('iban');
  assignString('gender');
  assignString('bloodGroup');
  assignString('religion');
  assignString('nationalId');
  assignString('address1');
  assignString('address2');
  assignString('city');
  assignString('state');
  assignString('postalCode');
  assignString('emergencyName');
  assignString('emergencyPhone');
  assignString('emergencyRelation');

  if (data.email) data.email = data.email.toLowerCase();

  assignDate('joiningDate');
  assignDate('probationEndDate');
  assignDate('contractEndDate');
  assignDate('dob');

  assignNumber('workHoursPerWeek');
  assignNumber('baseSalary');
  assignNumber('allowances');
  assignNumber('deductions');

  assignArray('subjects');
  assignArray('classes');

  const avatar = coerceString(raw.avatar) ?? coerceString(raw.photo) ?? coerceString(raw.photoUrl) ?? coerceString(raw.profilePhoto) ?? coerceString(raw.profilePhotoUrl);
  if (avatar !== undefined) data.avatar = avatar;

  const explicitSubject = coerceString(raw.subject);
  if (explicitSubject !== undefined) data.subject = explicitSubject;

  if (!('subject' in data) && data.specialization) data.subject = data.specialization;
  if (!('subject' in data) && Array.isArray(data.subjects) && data.subjects.length) data.subject = data.subjects[0];

  if (!partial) {
    if (!('employmentStatus' in data) || !data.employmentStatus) data.employmentStatus = 'active';
    if (!('employmentType' in data) || !data.employmentType) data.employmentType = 'fullTime';
    if (!('currency' in data) || !data.currency) data.currency = 'PKR';
    if (!('payFrequency' in data) || !data.payFrequency) data.payFrequency = 'monthly';
    if (!('paymentMethod' in data) || !data.paymentMethod) data.paymentMethod = 'bank';
    if (!('subjects' in data)) data.subjects = [];
    if (!('classes' in data)) data.classes = [];
    if (!('allowances' in data)) data.allowances = 0;
    if (!('deductions' in data)) data.deductions = 0;
  }

  if (data.employmentStatus && !data.status) data.status = data.employmentStatus;

  if (!partial && !('baseSalary' in data)) data.baseSalary = 0;

  return data;
};

export const list = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 50, q } = req.query;
    const result = await teachers.list({ page: Number(page), pageSize: Number(pageSize), q });
    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const teacher = await teachers.getById(Number(req.params.id));
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    return res.json(teacher);
  } catch (e) {
    next(e);
  }
};

export const getSchedule = async (req, res, next) => {
  try {
    const schedule = await teachers.getSchedule(Number(req.params.id));
    return res.json(schedule);
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res, next) => {
  try {
    const payload = normalizeTeacherPayload(req.body, { partial: false });
    const created = await teachers.create(payload);
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const payload = normalizeTeacherPayload(req.body, { partial: true });
    const updated = await teachers.update(Number(req.params.id), payload);
    if (!updated) return res.status(404).json({ message: 'Teacher not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await teachers.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Teacher not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
