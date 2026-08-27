const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().optional(),
  department: z.enum(['CSE', 'ECE', 'EEE', 'Mechanical', 'Civil', 'Other']).optional(),
  year: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year']).optional(),
  preferences: z
    .object({
      quietness: z.number().min(0).max(100).optional(),
      distance: z.number().min(0).max(100).optional(),
      facilities: z.number().min(0).max(100).optional(),
      studyType: z.enum(['Individual', 'Group']).optional(),
      windowSeat: z.boolean().optional(),
      charging: z.boolean().optional(),
      ac: z.boolean().optional(),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
