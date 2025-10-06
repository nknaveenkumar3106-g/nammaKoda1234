// Script to add test users to the database
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User schema (simplified)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['new_user', 'existing_user', 'explorer', 'admin'], default: 'new_user' },
  wallet: {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  transactions: [{
    amount: { type: Number, required: true },
    type: { type: String, enum: ['deposit', 'borrow', 'penalty', 'refund'], required: true },
    meta: { type: Object },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function addTestUsers() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/namma_kodai');
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Add test users
    const testUsers = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@gmail.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'existing_user',
        wallet: { balance: 150, currency: 'INR' },
        transactions: [
          { amount: 100, type: 'deposit', createdAt: new Date(Date.now() - 86400000) },
          { amount: -10, type: 'borrow', createdAt: new Date(Date.now() - 3600000) }
        ]
      },
      {
        name: 'Priya Sharma',
        email: 'priya@gmail.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'existing_user',
        wallet: { balance: 75, currency: 'INR' },
        transactions: [
          { amount: 50, type: 'deposit', createdAt: new Date(Date.now() - 172800000) },
          { amount: -10, type: 'borrow', createdAt: new Date(Date.now() - 7200000) },
          { amount: -25, type: 'penalty', createdAt: new Date(Date.now() - 1800000) }
        ]
      },
      {
        name: 'Amit Singh',
        email: 'amit@gmail.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'new_user',
        wallet: { balance: 200, currency: 'INR' },
        transactions: [
          { amount: 200, type: 'deposit', createdAt: new Date(Date.now() - 259200000) }
        ]
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@gmail.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'existing_user',
        wallet: { balance: 25, currency: 'INR' },
        transactions: [
          { amount: 100, type: 'deposit', createdAt: new Date(Date.now() - 345600000) },
          { amount: -10, type: 'borrow', createdAt: new Date(Date.now() - 10800000) },
          { amount: -10, type: 'borrow', createdAt: new Date(Date.now() - 14400000) },
          { amount: -25, type: 'penalty', createdAt: new Date(Date.now() - 9000000) },
          { amount: -25, type: 'penalty', createdAt: new Date(Date.now() - 5400000) }
        ]
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram@gmail.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'explorer',
        wallet: { balance: 0, currency: 'INR' },
        transactions: [
          { amount: -10, type: 'borrow', createdAt: new Date(Date.now() - 1800000) }
        ]
      }
    ];

    for (const user of testUsers) {
      await User.create(user);
      console.log(`Added user: ${user.name}`);
    }

    console.log('Test users added successfully!');
    console.log('Total users in database:', await User.countDocuments());
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding test users:', error);
    process.exit(1);
  }
}

addTestUsers();
