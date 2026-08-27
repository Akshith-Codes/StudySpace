const { z } = require('zod');

const createReviewSchema = z.object({
  space: z.string().min(1),
  booking: z.string().min(1),
  overall: z.number().min(1).max(5),
  cleanliness: z.number().min(1).max(5).optional(),
  noise: z.number().min(1).max(5).optional(),
  wifi: z.number().min(1).max(5).optional(),
  comfort: z.number().min(1).max(5).optional(),
  facilities: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

module.exports = { createReviewSchema };
