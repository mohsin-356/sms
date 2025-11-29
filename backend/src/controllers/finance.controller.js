import * as service from '../services/finance.service.js';

export const listInvoices = async (req, res, next) => {
  try {
    const { studentId, status, page, pageSize } = req.query;
    const items = await service.listInvoices({ studentId, status, page, pageSize });
    res.json({ items });
  } catch (e) { next(e); }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const row = await service.getInvoiceById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Invoice not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const createInvoice = async (req, res, next) => {
  try {
    const row = await service.createInvoice(req.body);
    res.status(201).json(row);
  } catch (e) { next(e); }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const row = await service.updateInvoice(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: 'Invoice not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    await service.deleteInvoice(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const listPayments = async (req, res, next) => {
  try {
    const items = await service.listPayments(req.params.id);
    res.json({ items });
  } catch (e) { next(e); }
};

export const addPayment = async (req, res, next) => {
  try {
    const row = await service.addPayment(req.params.id, req.body);
    res.status(201).json(row);
  } catch (e) { next(e); }
};
