import * as classService from '../services/classes.service.js';

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

const normalizeClassPayload = (raw = {}, { partial = false } = {}) => {
  const data = {};

  const assignString = (field, source = field) => {
    const value = coerceString(raw[source]);
    if (value !== undefined) data[field] = value;
  };

  const assignNumber = (field, source = field) => {
    const value = coerceNumber(raw[source]);
    if (value !== undefined) data[field] = value;
  };

  assignString('className');
  assignString('section');
  assignString('academicYear');
  assignString('room');
  assignString('medium');
  assignString('shift');
  assignString('status');
  assignString('notes');

  assignNumber('classTeacherId');
  assignNumber('capacity');
  assignNumber('enrolledStudents');

  const strength = coerceNumber(raw.strength);
  if (strength !== undefined) data.enrolledStudents = strength;

  if (!partial) {
    if (!('academicYear' in data) || data.academicYear === null) data.academicYear = '';
    if (!('status' in data) || !data.status) data.status = 'active';
  }

  return data;
};

export const list = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 50,
      search,
      className,
      section,
      academicYear,
      status,
      teacherId,
    } = req.query;
    const result = await classService.list({
      page: Number(page),
      pageSize: Number(pageSize),
      search,
      className,
      section,
      academicYear,
      status,
      teacherId: teacherId ? Number(teacherId) : undefined,
    });
    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const record = await classService.getById(Number(req.params.id));
    if (!record) return res.status(404).json({ message: 'Class section not found' });
    return res.json(record);
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res, next) => {
  try {
    const payload = normalizeClassPayload(req.body, { partial: false });
    const created = await classService.create(payload);
    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const payload = normalizeClassPayload(req.body, { partial: true });
    const updated = await classService.update(Number(req.params.id), payload);
    if (!updated) return res.status(404).json({ message: 'Class section not found' });
    return res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await classService.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Class section not found' });
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
