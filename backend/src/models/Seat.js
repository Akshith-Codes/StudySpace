const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySpace', required: true },
    seatNumber: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['standard', 'window', 'charging', 'silent', 'accessible', 'cabin'],
      default: 'standard',
    },
    row: { type: Number, default: 0 },
    column: { type: Number, default: 0 },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    status: { type: String, enum: ['available', 'occupied', 'disabled'], default: 'available' },
    features: [{ type: String }],
  },
  { timestamps: true }
);

seatSchema.index({ space: 1, seatNumber: 1 }, { unique: true });
seatSchema.index({ space: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);
