const { z } = require('zod');

const createIssueSchema = z.object({
  space: z.string().min(1),
  seat: z.string().optional(),
  type: z.enum(['AC', 'Wi-Fi', 'Furniture', 'Noise', 'Lighting', 'Charging', 'Other']),
  description: z.string().min(3).max(1000),
  image: z.string().optional(),
});

const updateIssueStatusSchema = z.object({
  status: z.enum(['reported', 'in-progress', 'resolved']),
});

module.exports = { createIssueSchema, updateIssueStatusSchema };
