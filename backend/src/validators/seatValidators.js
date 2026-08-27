const { z } = require('zod');

const seatTypeEnum = z.enum(['standard', 'window', 'charging', 'silent', 'accessible', 'cabin']);

const createSeatSchema = z.object({
  seatNumber: z.string().min(1),
  type: seatTypeEnum.optional(),
  row: z.number().optional(),
  column: z.number().optional(),
  position: z.object({ x: z.number().optional(), y: z.number().optional() }).optional(),
  status: z.enum(['available', 'occupied', 'disabled']).optional(),
  features: z.array(z.string()).optional(),
});

const updateSeatSchema = createSeatSchema.partial();

module.exports = { createSeatSchema, updateSeatSchema };
