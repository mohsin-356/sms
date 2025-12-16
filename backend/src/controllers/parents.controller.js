import * as parents from '../services/parents.service.js';
import { ensureParentsSchema } from '../db/autoMigrate.js';

export const list = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const { q, page = 1, pageSize = 50 } = req.query;
    const data = await parents.list({ q, page: Number(page), pageSize: Number(pageSize) });
    res.json(data);
  } catch (e) { next(e); }
};

export const getById = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const p = await parents.getById(Number(req.params.id));
    if (!p) return res.status(404).json({ message: 'Parent not found' });
    res.json(p);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const p = await parents.create(req.body || {});
    res.status(201).json(p);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const p = await parents.update(Number(req.params.id), req.body || {});
    if (!p) return res.status(404).json({ message: 'Parent not found' });
    res.json(p);
  } catch (e) { next(e); }
};

// Inform endpoint: send a custom message to parent's WhatsApp for a specific child
export const inform = async (req, res, next) => {
  try {
    await ensureParentsSchema();
    const { id } = req.params;
    const { childId, message } = req.body || {};
    if (!message) return res.status(400).json({ message: 'Message is required' });
    const p = await parents.getById(Number(id));
    if (!p) return res.status(404).json({ message: 'Parent not found' });
    const hasChild = Array.isArray(p.children) && p.children.some((c) => String(c.id) === String(childId));
    if (childId && !hasChild) return res.status(400).json({ message: 'Child not linked to this parent' });

    // Optional webhook integration
    let delivered = false;
    try {
      const webhook = process.env.WHATSAPP_WEBHOOK_URL;
      if (webhook && p.whatsappPhone && typeof fetch === 'function') {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: p.whatsappPhone, text: message, familyNumber: p.familyNumber, childId })
        });
        delivered = true;
      }
    } catch (_) {}

    res.json({ success: true, delivered, via: delivered ? 'webhook' : 'noop', to: p.whatsappPhone || null });
  } catch (e) { next(e); }
};
