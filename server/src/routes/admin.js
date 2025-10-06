import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Admin from '../models/Admin.js';

const router = express.Router();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_dev_secret';
const ADD_ADMIN_ACCESS_PASSWORD = process.env.ADD_ADMIN_ACCESS_PASSWORD || 'N3021K';

// Seed initial admin if none exists
router.post('/seed-initial', async (req, res) => {
  try {
    const exists = await Admin.findOne({ userId: 'NK3021T' });
    if (exists) return res.json({ ok: true, seeded: false });
    const passwordHash = await bcrypt.hash('3021nk', 10);
    await Admin.create({ name: 'Naveen.G', userId: 'NK3021T', passwordHash, role: 'super_admin' });
    return res.json({ ok: true, seeded: true });
  } catch (err) {
    console.error('[admin/seed-initial] error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  const schema = z.object({ userId: z.string().min(3), password: z.string().min(4) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { userId, password } = parse.data;
  try {
    const admin = await Admin.findOne({ userId });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: admin._id.toString(), role: admin.role, userId: admin.userId }, ADMIN_JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, admin: { id: admin._id, name: admin.name, userId: admin.userId, role: admin.role } });
  } catch (err) {
    console.error('[admin/login] error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Middleware for admin auth
function requireAdmin(req, res, next){
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ')? auth.slice(7) : '';
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = { id: payload.sub, role: payload.role, userId: payload.userId };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Add new admin (gated by access password)
router.post('/add', requireAdmin, async (req, res) => {
  const schema = z.object({ accessPassword: z.string(), name: z.string().min(2), userId: z.string().min(3), password: z.string().min(4), role: z.enum(['admin','super_admin']).optional() });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { accessPassword, name, userId, password, role } = parse.data;
  if (accessPassword !== ADD_ADMIN_ACCESS_PASSWORD) return res.status(403).json({ error: 'Invalid access password' });
  try {
    const exists = await Admin.findOne({ userId });
    if (exists) return res.status(409).json({ error: 'User ID already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ name, userId, passwordHash, role: role || 'admin' });
    return res.status(201).json({ ok: true, admin: { id: admin._id, name: admin.name, userId: admin.userId, role: admin.role } });
  } catch (err) {
    console.error('[admin/add] error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export { requireAdmin };
export default router;




