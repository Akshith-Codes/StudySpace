const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySpace', required: true },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', default: null },
    requestedDate: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    position: { type: Number, required: true },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'claimed', 'expired', 'cancelled'],
      default: 'waiting',
    },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

waitlistSchema.index({ space: 1, requestedDate: 1, status: 1, position: 1 });
waitlistSchema.index({ user: 1, space: 1, requestedDate: 1, startTime: 1, endTime: 1, status: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);
