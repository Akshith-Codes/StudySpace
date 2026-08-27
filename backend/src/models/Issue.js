const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    space: { type: mongoose.Schema.Types.ObjectId, ref: 'StudySpace', required: true },
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', default: null },
    type: {
      type: String,
      enum: ['AC', 'Wi-Fi', 'Furniture', 'Noise', 'Lighting', 'Charging', 'Other'],
      required: true,
    },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    image: { type: String, default: '' },
    status: { type: String, enum: ['reported', 'in-progress', 'resolved'], default: 'reported' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

issueSchema.index({ user: 1 });
issueSchema.index({ space: 1, status: 1 });

module.exports = mongoose.model('Issue', issueSchema);
