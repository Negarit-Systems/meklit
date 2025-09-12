import { z } from 'zod';

export const childCreateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.coerce.date(),
    centerId: z.string().min(1),
    classId: z.string().min(1),
  }),
});

export const childUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dateOfBirth: z.coerce.date().optional(),
    centerId: z.string().min(1).optional(),
    classId: z.string().min(1).optional(),
  }),
});
