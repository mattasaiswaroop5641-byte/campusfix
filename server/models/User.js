import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
  department: { type: String, required: true },
  block: { type: String, required: true },
  section: { type: String, default: undefined }, // Only for students
  email: { type: String, required: true, lowercase: true }
}, {
  timestamps: true
});

export const User = mongoose.model('User', UserSchema);
