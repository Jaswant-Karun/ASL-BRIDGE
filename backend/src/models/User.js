import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 32 },
  publicId: { type: String, required: true, unique: true, immutable: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);