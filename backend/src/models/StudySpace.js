const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const studySpaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    building: { type: String, trim: true },
    floor: { type: String, trim: true },
    type: {
      type: String,
      enum: ['library', 'reading-room', 'study-hall', 'cabin', 'discussion-room', 'quiet-zone'],
      required: true,
    },
    description: { type: String, trim: true },
    capacity: { type: Number, required: true, min: 0 },
    facilities: [
      {
        type: String,
        enum: ['wifi', 'ac', 'charging', 'power', 'silent', 'group-study', 'natural-light'],
      },
    ],
    noiseLevel: { type: String, enum: ['silent', 'quiet', 'moderate'], default: 'moderate' },
    openingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
    },
    location: { type: locationSchema, default: () => ({}) },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalSeats: { type: Number, default: 0 },
    availableSeats: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'closed', 'maintenance'], default: 'active' },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

studySpaceSchema.index({ name: 'text', building: 'text', description: 'text' });
studySpaceSchema.index({ type: 1 });
studySpaceSchema.index({ noiseLevel: 1 });
studySpaceSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('StudySpace', studySpaceSchema);
