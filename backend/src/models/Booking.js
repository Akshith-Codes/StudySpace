const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySpace', required: true },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled', 'no-show'],
      default: 'upcoming',
    },
    bookingId: { type: String, unique: true, default: () => `BK-${uuidv4().slice(0, 8).toUpperCase()}` },
    qrToken: { type: String, unique: true, default: () => uuidv4() },
    checkedInAt: { type: Date, default: null },
    checkedOutAt: { type: Date, default: null },
    noShowAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ seat: 1, date: 1, startTime: 1, endTime: 1 });
bookingSchema.index({ space: 1, date: 1 });
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ status: 1, startTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
