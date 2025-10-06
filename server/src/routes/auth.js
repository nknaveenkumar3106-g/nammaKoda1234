import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('[auth/register] Validation failed:', JSON.stringify(parse.error.flatten(), null, 2));
    return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
  }
  const { name, email, password } = parse.data;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: 'new_user' });
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, wallet: user.wallet }
    });
  } catch (err) {
    console.error('[auth/register] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Explorer sign-in: create short-lived account without payment
router.post('/explore', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      password: z.string().min(6).optional()
    });
    const parse = schema.safeParse(req.body || {});
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
    }
    const { name, email, password } = parse.data;
    const finalName = name || `Explorer-${Math.random().toString(36).slice(2,6)}`;
    const finalEmail = email || `explorer_${Date.now()}_${Math.random().toString(36).slice(2,4)}@example.local`;
    if (email) {
      const existing = await User.findOne({ email: finalEmail });
      if (existing) return res.status(409).json({ error: 'Email already used' });
    }
    const passwordHash = await bcrypt.hash(password || Math.random().toString(36), 10);
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours
    const user = await User.create({
      name: finalName,
      email: finalEmail,
      passwordHash,
      role: 'explorer',
      wallet: { balance: 0, currency: 'INR' },
      explorer: { enabled: true, expiresAt, borrowUsed: false }
    });
    const token = jwt.sign(
      { sub: user._id.toString(), role: 'explorer' },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '3h' }
    );
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, wallet: user.wallet, explorer: user.explorer, transactions: [] }
    });
  } catch (err) {
    console.error('[auth/explore] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('[auth/login] Validation failed:', JSON.stringify(parse.error.flatten(), null, 2));
    return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
  }
  const { email, password } = parse.data;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.role === 'new_user' && (user.wallet?.balance || 0) > 0) {
      user.role = 'existing_user';
      await user.save();
    }
    const token = jwt.sign(
      { sub: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, wallet: user.wallet, transactions: user.transactions?.slice(0,50) ?? [] }
    });
  } catch (err) {
    console.error('[auth/login] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const updateProfileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

router.put('/profile', requireAuth, async (req, res) => {
  const parse = updateProfileSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('[auth/profile] Validation failed:', JSON.stringify(parse.error.flatten(), null, 2));
    return res.status(400).json({ error: 'Invalid input', details: parse.error.flatten() });
  }
  const { name, email } = parse.data;
  try {
    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existingUser) return res.status(409).json({ error: 'Email already in use' });
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, wallet: user.wallet, transactions: user.transactions?.slice(0,50) ?? [] }
    });
  } catch (err) {
    console.error('[auth/profile] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Delete account: create a refund URL and delete the user
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const refundAmount = Math.max(0, user.wallet?.balance || 0);
    // In production, create a session with actual payment provider and return that URL
    const refundUrl = `${process.env.REFUND_REDIRECT_URL || 'https://example.com/refund'}?amount=${refundAmount}&email=${encodeURIComponent(user.email)}`;
    await User.deleteOne({ _id: user._id });
    return res.json({ ok: true, refundAmount, refundUrl });
  } catch (err) {
    console.error('[auth/deleteAccount] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
