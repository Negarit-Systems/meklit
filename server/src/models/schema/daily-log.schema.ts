import { z } from 'zod';

export const trendOverTimeSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    childId: z.string().optional(),
    classId: z.string().optional(),
    centerId: z.string().optional(),
  }),
});

export const staffPerformanceSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    centerId: z.string().optional(),
  }),
});

export const comparativeReportSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    groupBy: z.enum(['classId', 'childId']),
    centerId: z.string().optional(),
  }),
});
