// import express from 'express';
// import cors from 'cors';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import jwt from 'jsonwebtoken';
// import 'express-async-errors';

// import authRouter from './routes/auth.js';
// import walletRouter from './routes/wallet.js';
// import adminRouter from './routes/admin.js';
// import { requireAuth } from './middleware/auth.js';
// import { requireAdmin } from './routes/admin.js';

// dotenv.config();

// const app = express();

// // Fail fast instead of buffering DB ops while disconnected
// mongoose.set('bufferCommands', false);

// // Open CORS to all origins for all routes and responses
// app.use(cors({
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//   optionsSuccessStatus: 204
// }));
// app.options('*', cors());
// app.use(express.json());
// app.use(morgan('dev'));

// const isVercel = !!process.env.VERCEL;
// const MONGO_URI = process.env.MONGO_URI || (isVercel ? '' : 'mongodb://127.0.0.1:27017/namma_kodai');
// const PORT = process.env.PORT || 5001;

// if (isVercel && (!process.env.MONGO_URI || /localhost|127\.0\.0\.1/.test(process.env.MONGO_URI))) {
//   console.error('Missing or invalid MONGO_URI for production. Set a remote MongoDB connection string in Vercel env vars.');
//   process.exit(1);
// }

// mongoose
//   .connect(MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//   })
//   .catch((err) => {
//     // Do not exit on serverless; let requests return 503 via readiness gate
//     console.error('Mongo connection error (continuing to serve 503):', err.message);
//   });

// // Gate requests until Mongo connection is ready
// app.use((req, res, next) => {
//   if (mongoose.connection.readyState !== 1) {
//     // Ensure CORS headers are present even on errors
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Vary', 'Origin');
//     return res.status(503).json({ error: 'Database not connected' });
//   }
//   next();
// });

// // Global error handler that preserves CORS headers
// app.use((err, req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Vary', 'Origin');
//   const status = err.status || 500;
//   res.status(status).json({ error: err.message || 'Internal Server Error' });
// });

// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// // Test admin endpoint
// app.get('/api/admin/test', (req, res) => {
//   try {
//     const token = req.query.token;
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }
    
//     const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_dev_secret';
//     const payload = jwt.verify(token, ADMIN_JWT_SECRET);
//     res.json({ 
//       success: true, 
//       admin: { id: payload.sub, role: payload.role, userId: payload.userId },
//       message: 'Admin authentication successful'
//     });
//   } catch (err) {
//     res.status(401).json({ error: 'Invalid token', details: err.message });
//   }
// });

// app.use('/api/auth', authRouter);
// app.use('/api/wallet', walletRouter);
// app.use('/api/admin', adminRouter);

// // Server-Sent Events for real-time user updates
// app.get('/api/stream/user', requireAuth, (req, res) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');
//   res.flushHeaders?.();

//   const sendHeartbeat = () => {
//     res.write(`event: ping\n`);
//     res.write(`data: ${Date.now()}\n\n`);
//   };
//   const heartbeat = setInterval(sendHeartbeat, 25000);

//   // Simple in-process notifier via MongoDB change streams
//   const pipeline = [
//     { $match: { 'fullDocument._id': new mongoose.Types.ObjectId(req.user.id) } }
//   ];
//   const changeStream = mongoose.connection.collection('users').watch(pipeline, { fullDocument: 'updateLookup' });
//   changeStream.on('change', (change) => {
//     const doc = change.fullDocument || {};
//     const payload = {
//       id: doc._id,
//       name: doc.name,
//       email: doc.email,
//       wallet: doc.wallet,
//       role: doc.role,
//       explorer: doc.explorer,
//       transactions: (doc.transactions || []).slice(0,50)
//     };
//     res.write(`event: user\n`);
//     res.write(`data: ${JSON.stringify(payload)}\n\n`);
//   });

//   req.on('close', () => {
//     clearInterval(heartbeat);
//     changeStream.close().catch(()=>{});
//     res.end();
//   });
// });

// // Real-time admin dashboard data stream
// app.get('/api/stream/admin', (req, res) => {
//   // Handle admin authentication via query parameter (for EventSource compatibility)
//   try {
//     const token = req.query.token;
//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }
    
//     const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_dev_secret';
//     const payload = jwt.verify(token, ADMIN_JWT_SECRET);
//     req.admin = { id: payload.sub, role: payload.role, userId: payload.userId };
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
  
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');
//   res.flushHeaders?.();

//   const sendHeartbeat = () => {
//     res.write(`event: ping\n`);
//     res.write(`data: ${Date.now()}\n\n`);
//   };
//   const heartbeat = setInterval(sendHeartbeat, 30000);

//   // Helper to compute stats and a recent transactions view
//   const buildStatsAndTxns = (users) => {
//     const stats = {
//       total: users.length,
//       active: users.filter(u => u.role !== 'blocked').length,
//       newUsers: users.filter(u => u.role === 'new_user').length,
//       existingUsers: users.filter(u => u.role === 'existing_user').length,
//       explorers: users.filter(u => u.role === 'explorer').length
//     };

//     const allTransactions = [];
//     users.forEach(user => {
//       if (Array.isArray(user.transactions)) {
//         user.transactions.slice(-10).forEach(txn => {
//           allTransactions.push({
//             ...txn,
//             userName: user.name,
//             userEmail: user.email
//           });
//         });
//       }
//     });

//     const recentTransactions = allTransactions
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .slice(0, 50);

//     return { stats, transactions: recentTransactions };
//   };

//   const usersCollection = mongoose.connection.collection('users');

//   // Initial snapshot
//   const sendInitialData = async () => {
//     try {
//       const users = await usersCollection.find({}).toArray();
//       const { stats, transactions } = buildStatsAndTxns(users);
//       res.write(`event: initial\n`);
//       res.write(`data: ${JSON.stringify({ users, stats, transactions })}\n\n`);
//     } catch (err) {
//       console.error('❌ Error sending initial data:', err);
//     }
//   };

//   // Periodic refresh (works without replica sets)
//   const refreshInterval = setInterval(async () => {
//     try {
//       const users = await usersCollection.find({}).toArray();
//       const { stats, transactions } = buildStatsAndTxns(users);
//       res.write(`event: users\n`);
//       res.write(`data: ${JSON.stringify({ users, stats })}\n\n`);
//       res.write(`event: transactions\n`);
//       res.write(`data: ${JSON.stringify({ transactions })}\n\n`);
//     } catch (err) {
//       // transient errors are ignored; next tick will retry
//     }
//   }, 10000);

//   sendInitialData();

//   req.on('close', () => {
//     clearInterval(heartbeat);
//     clearInterval(refreshInterval);
//     res.end();
//   });
// });

// // Only start the HTTP server when running locally (not on Vercel serverless)
// if (!process.env.VERCEL) {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }

// export default app;


// src/index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import 'express-async-errors';

import authRouter from './routes/auth.js';
import walletRouter from './routes/wallet.js';
import adminRouter from './routes/admin.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const app = express();

// MongoDB bufferCommands off
mongoose.set('bufferCommands', false);

// ----- CORS setup -----
// Allow localhost (dev) and deployed frontend (replace with your Vercel frontend domain)
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server or Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.options('*', cors()); // preflight

// ----- Middleware -----
app.use(express.json());
app.use(morgan('dev'));

// ----- MongoDB connection -----
const isVercel = !!process.env.VERCEL;
const MONGO_URI = process.env.MONGO_URI || (isVercel ? '' : 'mongodb://127.0.0.1:27017/namma_kodai');

if (isVercel && (!process.env.MONGO_URI || /localhost|127\.0\.0\.1/.test(process.env.MONGO_URI))) {
  console.error('Missing or invalid MONGO_URI for production.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Mongo connection error:', err.message));

// Gate requests until Mongo connection is ready
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Vary', 'Origin');
    return res.status(503).json({ error: 'Database not connected' });
  }
  next();
});

// ----- Global error handler -----
app.use((err, req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

// ----- Health check -----
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ----- Test data endpoint -----
app.post('/api/test-data', async (req, res) => {
  try {
    const usersCollection = mongoose.connection.collection('users');
    
    // Add test users with transactions
    const testUsers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@gmail.com',
        passwordHash: 'hashed_password',
        role: 'existing_user',
        wallet: { balance: 150, currency: 'INR' },
        transactions: [
          { amount: 100, type: 'deposit', createdAt: new Date(Date.now() - 86400000), meta: { method: 'UPI' } },
          { amount: -10, type: 'borrow', createdAt: new Date(Date.now() - 3600000), meta: { stationName: 'Main Gate' } }
        ],
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        name: 'Priya Sharma',
        email: 'priya@gmail.com',
        passwordHash: 'hashed_password',
        role: 'existing_user',
        wallet: { balance: 75, currency: 'INR' },
        transactions: [
          { amount: 50, type: 'deposit', createdAt: new Date(Date.now() - 172800000), meta: { method: 'Card' } },
          { amount: -10, type: 'borrow', createdAt: new Date(Date.now() - 7200000), meta: { stationName: 'Library' } },
          { amount: -25, type: 'penalty', createdAt: new Date(Date.now() - 1800000), meta: { reason: 'Late return' } }
        ],
        createdAt: new Date(Date.now() - 172800000)
      },
      {
        name: 'Amit Singh',
        email: 'amit@gmail.com',
        passwordHash: 'hashed_password',
        role: 'new_user',
        wallet: { balance: 200, currency: 'INR' },
        transactions: [
          { amount: 200, type: 'deposit', createdAt: new Date(Date.now() - 259200000), meta: { method: 'UPI' } }
        ],
        createdAt: new Date(Date.now() - 259200000)
      }
    ];
    
    // Clear existing users and insert test data
    await usersCollection.deleteMany({});
    await usersCollection.insertMany(testUsers);
    
    res.json({ 
      success: true, 
      message: 'Test data added successfully',
      usersAdded: testUsers.length
    });
  } catch (err) {
    console.error('Error adding test data:', err);
    res.status(500).json({ error: 'Failed to add test data' });
  }
});

// ----- Admin test endpoint -----
app.get('/api/admin/test', (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_dev_secret';
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    res.json({ success: true, admin: payload, message: 'Admin authentication successful' });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token', details: err.message });
  }
});

// ----- Routers -----
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/admin', adminRouter);

// ----- SSE: user stream -----
app.get('/api/stream/user', requireAuth, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 25000);

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
    res.write(`event: user\ndata: ${JSON.stringify(payload)}\n\n`);
  });

  req.on('close', () => {
    clearInterval(heartbeat);
    changeStream.close().catch(()=>{});
    res.end();
  });
});

// ----- SSE: admin stream -----
app.get('/api/stream/admin', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_dev_secret';
    const payload = jwt.verify(token, ADMIN_JWT_SECRET);
    req.admin = payload;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const heartbeat = setInterval(() => {
    res.write(`event: ping\ndata: ${Date.now()}\n\n`);
  }, 30000);

  const usersCollection = mongoose.connection.collection('users');

  const sendData = async () => {
    const users = await usersCollection.find({}).toArray();
    const stats = {
      total: users.length,
      active: users.filter(u => u.role !== 'blocked').length
    };
    
    // Get all transactions from all users
    const allTransactions = [];
    users.forEach(user => {
      if (Array.isArray(user.transactions)) {
        user.transactions.forEach(txn => {
          allTransactions.push({
            ...txn,
            userName: user.name,
            userEmail: user.email
          });
        });
      }
    });
    
    // Sort transactions by date (newest first)
    const sortedTransactions = allTransactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 100); // Limit to 100 most recent
    
    res.write(`event: initial\ndata: ${JSON.stringify({ users, stats, transactions: sortedTransactions })}\n\n`);
  };
  await sendData();

  const interval = setInterval(async () => {
    const users = await usersCollection.find({}).toArray();
    const stats = { total: users.length, active: users.filter(u => u.role !== 'blocked').length };
    
    // Get all transactions from all users
    const allTransactions = [];
    users.forEach(user => {
      if (Array.isArray(user.transactions)) {
        user.transactions.forEach(txn => {
          allTransactions.push({
            ...txn,
            userName: user.name,
            userEmail: user.email
          });
        });
      }
    });
    
    // Sort transactions by date (newest first)
    const sortedTransactions = allTransactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 100); // Limit to 100 most recent
    
    res.write(`event: users\ndata: ${JSON.stringify({ users, stats })}\n\n`);
    res.write(`event: transactions\ndata: ${JSON.stringify({ transactions: sortedTransactions })}\n\n`);
  }, 10000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(interval);
    res.end();
  });
});

// ----- Start server (only locally) -----
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;
