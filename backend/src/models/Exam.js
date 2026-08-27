const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true, trim: true },
    examDate: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

examSchema.index({ user: 1, examDate: 1 });

module.exports = mongoose.model('Exam', examSchema);
