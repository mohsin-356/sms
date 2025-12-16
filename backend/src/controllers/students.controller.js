import * as students from '../services/students.service.js';
import cloudinary from '../config/cloudinary.js';
import { ensureStudentExtendedColumns, ensureFinanceConstraints, ensureParentsSchema } from '../db/autoMigrate.js';
import * as parentsSvc from '../services/parents.service.js';

export const list = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    const { page = 1, pageSize = 50, q, class: cls, section } = req.query;
    const result = await students.list({ page: Number(page), pageSize: Number(pageSize), q, class: cls, section });
    return res.json(result);
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    const student = await students.getById(Number(req.params.id));
    if (!student) return res.status(404).json({ message: 'Student not found' });
    return res.json(student);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    await ensureParentsSchema();
    const payload = { ...req.body };
    // Upload base64 avatar to Cloudinary if provided
    if (payload.avatar && typeof payload.avatar === 'string' && payload.avatar.startsWith('data:')) {
      try {
        const upload = await cloudinary.uploader.upload(payload.avatar, { folder: 'students' });
        payload.avatar = upload.secure_url;
      } catch (_) {
        // If upload fails, drop avatar to avoid storing large base64
        payload.avatar = null;
      }
    }
    // Ensure a parents record exists and attach family number
    try {
      const p = payload.parent || {};
      const familyNumberInput = payload.familyNumber || p.familyNumber;
      const ensured = await parentsSvc.ensureByFamilyNumber({
        familyNumber: familyNumberInput,
        primaryName: p?.father?.name || p?.mother?.name || payload.parentName || payload.name || null,
        fatherName: p?.father?.name || null,
        motherName: p?.mother?.name || null,
        whatsappPhone: p?.father?.phone || p?.mother?.phone || null,
        email: p?.father?.email || p?.mother?.email || payload.email || null,
        address: p?.address || null,
      });
      if (ensured?.familyNumber) payload.familyNumber = ensured.familyNumber;
    } catch (_) {}

    const created = await students.create(payload);
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    await ensureStudentExtendedColumns();
    const data = { ...req.body };
    // Upload base64 avatar to Cloudinary if provided on update
    if (data.avatar && typeof data.avatar === 'string' && data.avatar.startsWith('data:')) {
      try {
        const upload = await cloudinary.uploader.upload(data.avatar, { folder: 'students' });
        data.avatar = upload.secure_url;
      } catch (_) {
        // Keep existing avatar if upload fails
        delete data.avatar;
      }
    }
    const updated = await students.update(Number(req.params.id), data);
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    return res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    const ok = await students.remove(Number(req.params.id));
    if (!ok) return res.status(404).json({ message: 'Student not found' });
    return res.json({ success: true });
  } catch (e) { next(e); }
};

// Attendance (per-student)
export const listAttendance = async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);
    const { startDate, endDate, page = 1, pageSize = 50 } = req.query;
    const data = await students.listAttendance(studentId, { startDate, endDate, page: Number(page), pageSize: Number(pageSize) });
    return res.json(data);
  } catch (e) { next(e); }
};

export const addAttendance = async (req, res, next) => {
  try {
    const studentId = Number(req.params.id);
    const created = await students.addAttendance(studentId, req.body);
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const updated = await students.updateAttendance(Number(req.params.attendanceId), req.body);
    if (!updated) return res.status(404).json({ message: 'Attendance not found' });
    return res.json(updated);
  } catch (e) { next(e); }
};

export const removeAttendance = async (req, res, next) => {
  try {
    const ok = await students.removeAttendance(Number(req.params.attendanceId));
    if (!ok) return res.status(404).json({ message: 'Attendance not found' });
    return res.json({ success: true });
  } catch (e) { next(e); }
};

// Performance
export const getPerformance = async (req, res, next) => {
  try {
    const data = await students.getPerformance(Number(req.params.id));
    return res.json(data);
  } catch (e) { next(e); }
};

// Fees
export const getFees = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    const data = await students.getFees(Number(req.params.id));
    return res.json(data);
  } catch (e) { next(e); }
};

export const recordPayment = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    const created = await students.recordPayment(Number(req.params.id), req.body);
    if (!created) return res.status(404).json({ message: 'Invoice not found for student' });
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const createInvoice = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    const created = await students.createInvoice(Number(req.params.id), req.body);
    return res.status(201).json(created);
  } catch (e) { next(e); }
};

export const updateInvoice = async (req, res, next) => {
  try {
    await ensureFinanceConstraints();
    const row = await students.updateInvoice(
      Number(req.params.id),
      Number(req.params.invoiceId),
      req.body
    );
    if (!row) return res.status(404).json({ message: 'Invoice not found for student' });
    return res.json(row);
  } catch (e) { next(e); }
};

// Transport
export const getTransport = async (req, res, next) => {
  try {
    const data = await students.getTransport(Number(req.params.id));
    return res.json(data || {});
  } catch (e) { next(e); }
};

export const updateTransport = async (req, res, next) => {
  try {
    const data = await students.updateTransport(Number(req.params.id), req.body);
    return res.json(data);
  } catch (e) { next(e); }
};
