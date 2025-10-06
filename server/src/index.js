import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import authRouter from './routes/auth.js';
import walletRouter from './routes/wallet.js';
import adminRouter from './routes/admin.js';
import { requireAuth } from './middleware/auth.js';
import { requireAdmin } from './routes/admin.js';

dotenv.config();

const app = express();

// Fail fast instead of buffering DB ops while disconnected
mongoose.set('bufferCommands', false);

// Configurable CORS to allow local dev and deployed clients
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

const isVercel = !!process.env.VERCEL;
const MONGO_URI = process.env.MONGO_URI || (isVercel ? '' : 'mongodb://127.0.0.1:27017/namma_kodai');
const PORT = process.env.PORT || 5001;

if (isVercel && (!process.env.MONGO_URI || /localhost|127\.0\.0\.1/.test(process.env.MONGO_URI))) {
  console.error('Missing or invalid MONGO_URI for production. Set a remote MongoDB connection string in Vercel env vars.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('Mongo connection error:', err);
    process.exit(1);
  });

// Gate requests until Mongo connection is ready
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test admin endpoint
app.get('/api/admin/test', (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_dev_secret';
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    res.json({ 
      success: true, 
      admin: { id: payload.sub, role: payload.role, userId: payload.userId },
      message: 'Admin authentication successful'
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token', details: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/admin', adminRouter);

// Server-Sent Events for real-time user updates
app.get('/api/stream/user', requireAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendHeartbeat = () => {
    res.write(`event: ping\n`);
    res.write(`data: ${Date.now()}\n\n`);
  };
  const heartbeat = setInterval(sendHeartbeat, 25000);

  // Simple in-process notifier via MongoDB change streams
  const pipeline = [
    { $match: { 'fullDocument._id': new mongoose.Types.ObjectId(req.user.id) } }
  ];
  const changeStream = mongoose.connection.collection('users').watch(pipeline, { fullDocument: 'updateLookup' });
  changeStream.on('change', (change) => {
    const doc = change.fullDocument || {};
    const payload = {
      id: doc._id,
      name: doc.name,
      email: doc.email,
      wallet: doc.wallet,
      role: doc.role,
      explorer: doc.explorer,
      transactions: (doc.transactions || []).slice(0,50)
    };
    res.write(`event: user\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  req.on('close', () => {
    clearInterval(heartbeat);
    changeStream.close().catch(()=>{});
    res.end();
  });
});

// Real-time admin dashboard data stream
app.get('/api/stream/admin', (req, res) => {
  // Handle admin authentication via query parameter (for EventSource compatibility)
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_dev_secret';
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = { id: payload.sub, role: payload.role, userId: payload.userId };
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendHeartbeat = () => {
    res.write(`event: ping\n`);
    res.write(`data: ${Date.now()}\n\n`);
  };
  const heartbeat = setInterval(sendHeartbeat, 30000);

  // Helper to compute stats and a recent transactions view
  const buildStatsAndTxns = (users) => {
    const stats = {
      total: users.length,
      active: users.filter(u => u.role !== 'blocked').length,
      newUsers: users.filter(u => u.role === 'new_user').length,
      existingUsers: users.filter(u => u.role === 'existing_user').length,
      explorers: users.filter(u => u.role === 'explorer').length
    };

    const allTransactions = [];
    users.forEach(user => {
      if (Array.isArray(user.transactions)) {
        user.transactions.slice(-10).forEach(txn => {
          allTransactions.push({
            ...txn,
            userName: user.name,
            userEmail: user.email
          });
        });
      }
    });

    const recentTransactions = allTransactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    return { stats, transactions: recentTransactions };
  };

  const usersCollection = mongoose.connection.collection('users');

  // Initial snapshot
  const sendInitialData = async () => {
    try {
      const users = await usersCollection.find({}).toArray();
      const { stats, transactions } = buildStatsAndTxns(users);
      res.write(`event: initial\n`);
      res.write(`data: ${JSON.stringify({ users, stats, transactions })}\n\n`);
    } catch (err) {
      console.error('❌ Error sending initial data:', err);
    }
  };

  // Periodic refresh (works without replica sets)
  const refreshInterval = setInterval(async () => {
    try {
      const users = await usersCollection.find({}).toArray();
      const { stats, transactions } = buildStatsAndTxns(users);
      res.write(`event: users\n`);
      res.write(`data: ${JSON.stringify({ users, stats })}\n\n`);
      res.write(`event: transactions\n`);
      res.write(`data: ${JSON.stringify({ transactions })}\n\n`);
    } catch (err) {
      // transient errors are ignored; next tick will retry
    }
  }, 10000);

  sendInitialData();

  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(refreshInterval);
    res.end();
  });
});

// Only start the HTTP server when running locally (not on Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
