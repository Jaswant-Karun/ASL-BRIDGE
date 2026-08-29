import mongoose from 'mongoose';

const EDUCATION_LEVELS = [
  'Primary School', 'Middle School', 'High School',
  'Diploma', 'Undergraduate', 'Postgraduate', 'Doctorate', 'Other'
];

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true, maxlength: 80 },
  username:     { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 32 },
  publicId:     { type: String, required: true, unique: true, immutable: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  dateOfBirth:  { type: Date,   default: null },
  education:    { type: String, enum: [...EDUCATION_LEVELS, ''], default: '' },
}, { timestamps: true });

// Virtual: age in years (null if DOB not set)
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

export default mongoose.model('User', userSchema);
