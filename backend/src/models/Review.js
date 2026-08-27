const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySpace', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    overall: { type: Number, required: true, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    noise: { type: Number, min: 1, max: 5 },
    wifi: { type: Number, min: 1, max: 5 },
    comfort: { type: Number, min: 1, max: 5 },
    facilities: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.index({ space: 1, user: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
