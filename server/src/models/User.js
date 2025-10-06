import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema(
  {
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['new_user', 'existing_user', 'explorer', 'admin'], default: 'new_user' },
    wallet: { type: WalletSchema, default: () => ({}) },
    currentBorrow: {
      active: { type: Boolean, default: false },
      stationId: { type: String },
      stationName: { type: String },
      startedAt: { type: Date },
      // computed client-side timer but persisted for integrity
      dueAt: { type: Date }
    },
    explorer: {
      enabled: { type: Boolean, default: false },
      expiresAt: { type: Date },
      borrowUsed: { type: Boolean, default: false }
    },
    transactions: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ['deposit', 'borrow', 'penalty', 'refund'], required: true },
        meta: { type: Object },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);


