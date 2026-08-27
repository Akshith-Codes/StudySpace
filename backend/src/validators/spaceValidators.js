const { z } = require('zod');

const spaceTypeEnum = z.enum(['library', 'reading-room', 'study-hall', 'cabin', 'discussion-room', 'quiet-zone']);
const noiseLevelEnum = z.enum(['silent', 'quiet', 'moderate']);
const facilityEnum = z.enum(['wifi', 'ac', 'charging', 'power', 'silent', 'group-study', 'natural-light']);

const createSpaceSchema = z.object({
  name: z.string().min(2),
  building: z.string().optional(),
  floor: z.string().optional(),
  type: spaceTypeEnum,
  description: z.string().optional(),
  capacity: z.number().min(0),
  facilities: z.array(facilityEnum).optional(),
  noiseLevel: noiseLevelEnum.optional(),
  openingHours: z
    .object({ open: z.string().optional(), close: z.string().optional() })
    .optional(),
  location: z
    .object({ latitude: z.number().optional(), longitude: z.number().optional() })
    .optional(),
  image: z.string().optional(),
  status: z.enum(['active', 'closed', 'maintenance']).optional(),
});

const updateSpaceSchema = createSpaceSchema.partial();

module.exports = { createSpaceSchema, updateSpaceSchema };
