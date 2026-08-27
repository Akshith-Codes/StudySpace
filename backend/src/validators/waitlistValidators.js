const { z } = require('zod');

const createWaitlistSchema = z.object({
  space: z.string().min(1),
  seat: z.string().optional(),
  requestedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'requestedDate must be YYYY-MM-DD'),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
});

module.exports = { createWaitlistSchema };
