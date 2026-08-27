const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const preferencesSchema = new mongoose.Schema(
  {
    quietness: { type: Number, default: 30, min: 0, max: 100 },
    distance: { type: Number, default: 15, min: 0, max: 100 },
    facilities: { type: Number, default: 20, min: 0, max: 100 },
    studyType: { type: String, enum: ['Individual', 'Group'], default: 'Individual' },
    windowSeat: { type: Boolean, default: false },
    charging: { type: Boolean, default: false },
    ac: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    studentId: { type: String, unique: true, sparse: true, trim: true },
    department: {
      type: String,
      enum: ['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other'],
      default: 'Other',
    },
    year: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      default: '1st Year',
    },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    preferences: { type: preferencesSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
