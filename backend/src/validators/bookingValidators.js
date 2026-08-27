const { z } = require('zod');

const createBookingSchema = z.object({
  space: z.string().min(1, 'space id is required'),
  seat: z.string().min(1, 'seat id is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  startTime: z.string().min(1, 'startTime is required (ISO datetime)'),
  endTime: z.string().min(1, 'endTime is required (ISO datetime)'),
});

module.exports = { createBookingSchema };
