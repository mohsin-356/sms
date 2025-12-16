import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import * as authService from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

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
