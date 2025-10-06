import express from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const depositSchema = z.object({ amount: z.number().positive() });
const borrowSchema = z.object({ stationId: z.string().min(1), stationName: z.string().min(1) });

router.get('/balance', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ balance: user.wallet.balance, currency: user.wallet.currency, transactions: user.transactions?.slice(0,50) ?? [], currentBorrow: user.currentBorrow || null });
  } catch (err) {
    console.error('[wallet/balance] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.post('/deposit', requireAuth, async (req, res) => {
  try {
    const parse = depositSchema.safeParse({ amount: Number(req.body.amount) });
    if (!parse.success) {
      console.error('[wallet/deposit] Validation failed:', JSON.stringify(parse.error.flatten(), null, 2));
      return res.status(400).json({ error: 'Invalid amount', details: parse.error.flatten() });
    }
    const { amount } = parse.data;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wallet.balance += amount; // demo fake deposit
    user.transactions.unshift({ amount, type: 'deposit' });
    if (user.role === 'new_user' && user.wallet.balance > 0) {
      user.role = 'existing_user';
    }
    await user.save();
    return res.json({ balance: user.wallet.balance, currency: user.wallet.currency, transactions: user.transactions.slice(0,50) });
  } catch (err) {
    console.error('[wallet/deposit] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Borrow: deduct 50 coins upfront, start session for 2 hours by default
router.post('/borrow', requireAuth, async (req, res) => {
  try {
    const parse = borrowSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Invalid borrow input', details: parse.error.flatten() });
    }
    const { stationId, stationName } = parse.data;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.currentBorrow?.active) return res.status(409).json({ error: 'Already borrowing an umbrella' });
    const now = new Date();
    const isExplorer = user.role === 'explorer' && user.explorer?.enabled && user.explorer?.expiresAt && now < new Date(user.explorer.expiresAt);
    if (!isExplorer && (user.wallet.balance ?? 0) < 50) return res.status(402).json({ error: 'Insufficient coins (need 50)' });

    let due;
    if (isExplorer) {
      if (user.explorer?.borrowUsed) return res.status(409).json({ error: 'Explorer one-time borrow already used' });
      // Explorer free borrow for 50 minutes
      due = new Date(now.getTime() + 50 * 60 * 1000);
      user.explorer.borrowUsed = true;
    } else {
      user.wallet.balance -= 50;
      user.transactions.unshift({ amount: -50, type: 'borrow', meta: { stationId, stationName } });
      due = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    }
    user.currentBorrow = { active: true, stationId, stationName, startedAt: now, dueAt: due };
    await user.save();
    return res.json({ ok: true, balance: user.wallet.balance, currentBorrow: user.currentBorrow, transactions: user.transactions.slice(0,50) });
  } catch (err) {
    console.error('[wallet/borrow] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Return: if within 24h, refund 50; else add 5 coins per hour overdue
router.post('/return', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.currentBorrow?.active) return res.status(409).json({ error: 'No active borrow' });

    const started = new Date(user.currentBorrow.startedAt).getTime();
    const now = Date.now();
    const elapsedMs = now - started;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    let delta = 0;
    let entryType = 'refund';
    let meta = { stationId: user.currentBorrow.stationId, stationName: user.currentBorrow.stationName };
    const isExplorer = user.role === 'explorer';
    const withinExplorerFree = isExplorer && elapsedMs <= (50 * 60 * 1000);
    if (withinExplorerFree || (!isExplorer && elapsedMs <= twentyFourHoursMs)) {
      delta = +50; // refund
      entryType = 'refund';
    } else {
      const base = isExplorer ? (50 * 60 * 1000) : twentyFourHoursMs;
      const overdueHours = Math.ceil((elapsedMs - base) / (60 * 60 * 1000));
      const penalty = 5 * overdueHours;
      delta = -penalty;
      entryType = 'penalty';
      meta.overdueHours = overdueHours;
    }

    if (!isExplorer) {
      user.wallet.balance += delta;
      user.transactions.unshift({ amount: delta, type: entryType, meta });
    }
    user.currentBorrow = { active: false };
    await user.save();
    return res.json({ ok: true, balance: user.wallet.balance, transactions: user.transactions.slice(0,50), currentBorrow: user.currentBorrow });
  } catch (err) {
    console.error('[wallet/return] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;


