const { z } = require('zod');

const createExamSchema = z.object({
  subject: z.string().min(1),
  examDate: z.string().min(1, 'examDate is required (ISO date)'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const updateExamSchema = createExamSchema.partial();

module.exports = { createExamSchema, updateExamSchema };
