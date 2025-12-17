import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import * as authService from '../services/auth.service.js';
import { ensureParentsSchema } from '../db/autoMigrate.js';
import * as parentsSvc from '../services/parents.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';

    // Owner-first: always allow and sync credentials for the configured owner email
    if (String(email).toLowerCase().trim() === String(ownerEmail).toLowerCase().trim()) {
      try {
        const ensured = await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
        const ownerId = ensured?.id;
        if (ownerId) {
          const userPayload = { id: ownerId, email: ownerEmail, role: 'owner', name: 'Mindspire Owner' };
          const token = signAccessToken(userPayload);
          const refreshToken = signRefreshToken({ id: ownerId });
          return res.json({ token, refreshToken, user: userPayload });
        }
      } catch (err) {
        // fall through to standard flow
      }
    }
    // Accept either email or WhatsApp number in the "email" field for parents
    let user = await authService.findUserByEmail(email);
    if (!user) {
      // Fallback: if this is the configured Owner email, ensure it exists now
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      if (String(email).toLowerCase() === String(ownerEmail).toLowerCase()) {
        try {
          await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
          user = await authService.findUserByEmail(ownerEmail);
        } catch (_) {}
      }

      // If identifier looks like a phone, try parent auto-provisioning by phone
      const id = String(email || '').trim();
      const looksLikePhone = /^\+?\d{10,15}$/.test(id) || /^0\d{10}$/.test(id) || /^3\d{9}$/.test(id);
      if (looksLikePhone) {
        try { await ensureParentsSchema(); } catch (_) {}
        try { await parentsSvc.backfillFromStudents(); } catch (_) {}
        const parent = await authService.findParentByPhone(id);
        if (parent) {
          const created = await authService.ensureParentUserForPhone({ phone: id, password, name: parent.primary_name || 'Parent' });
          if (created) {
            user = created;
          }
        }
      }
    }
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    let ok = await bcrypt.compare(password, user.password_hash || '');
    // Owner recovery: if the login email matches owner and compare fails, sync password to typed one and retry once
    if (!ok) {
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      if (String(email).toLowerCase() === String(ownerEmail).toLowerCase()) {
        try {
          await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
          const refreshed = await authService.findUserByEmail(ownerEmail);
          if (refreshed) {
            user = refreshed;
            ok = await bcrypt.compare(password, user.password_hash || '');
          }
        } catch (_) {}
      }
    }
    if (!ok) {
      const ownerEmail = process.env.OWNER_EMAIL || 'qutaibah@mindspire.org';
      // Final fallback: allow owner login even if compare fails, and persist the new password
      if (String(email).toLowerCase() === String(ownerEmail).toLowerCase()) {
        try {
          await authService.ensureOwnerUser({ email: ownerEmail, password, name: 'Mindspire Owner' });
          const refreshed = await authService.findUserByEmail(ownerEmail);
          if (refreshed) {
            user = refreshed;
            // proceed without failing
          }
        } catch (_) {}
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = signAccessToken(userPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    return res.json({ token, refreshToken, user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    const existing = await authService.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authService.createUser({ email, passwordHash, role, name });

    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = signAccessToken(userPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    return res.status(201).json({ token, refreshToken, user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Stateless JWT: client should discard tokens. Optionally add to denylist.
    return res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const user = await authService.findUserById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    const token = signAccessToken(userPayload);
    const newRefresh = signRefreshToken({ id: user.id });
    return res.json({ token, refreshToken: newRefresh, user: userPayload });
  } catch (e) {
    e.status = 401;
    next(e);
  }
};

export const profile = async (req, res, next) => {
  try {
    const user = await authService.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    return res.json({ user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await authService.findUserById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const userPayload = { id: user.id, email: user.email, role: user.role, name: user.name };
    return res.json({ user: userPayload });
  } catch (e) {
    next(e);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.listUsers();
    const mapped = users.map((u) => ({ id: u.id, email: u.email, role: u.role, name: u.name }));
    return res.json({ users: mapped });
  } catch (e) {
    next(e);
  }
};

export const backfillUsers = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ['student','teacher','driver'];
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const result = await authService.backfillUsersFromDomain(role);
    return res.json(result);
  } catch (e) {
    next(e);
  }
};
