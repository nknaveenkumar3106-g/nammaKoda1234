import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['super_admin','admin'], default: 'admin' }
}, { timestamps: true });

export default mongoose.model('Admin', AdminSchema);




