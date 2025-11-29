import * as attendanceService from '../services/attendance.service.js';

export const list = async (req, res, next) => {
  try {
    const { studentId, startDate, endDate, page, pageSize } = req.query;
    const rows = await attendanceService.list({ studentId, startDate, endDate, page, pageSize });
    res.json({ items: rows });
  } catch (e) {
    next(e);
  }
};

export const getById = async (req, res, next) => {
  try {
    const row = await attendanceService.getById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Record not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
};

export const create = async (req, res, next) => {
  try {
    const { studentId, date, status, remarks } = req.body;
    const createdBy = req.user?.id;
    const row = await attendanceService.create({ studentId, date, status, remarks, createdBy });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
};

export const update = async (req, res, next) => {
  try {
    const row = await attendanceService.update(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: 'Record not found' });
    res.json(row);
  } catch (e) {
    next(e);
  }
};

export const remove = async (req, res, next) => {
  try {
    await attendanceService.remove(req.params.id);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};
