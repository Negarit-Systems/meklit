import { z } from 'zod';

export const trendOverTimeSchema = z.object({
  query: z.object({
    startDate: z.string(),
    endDate: z.string(),
    childId: z.string().optional(),
    classId: z.string().optional(),
    centerId: z.string().optional(),
  }),
});

export const staffPerformanceSchema = z.object({
  query: z.object({
    startDate: z.string(),
    endDate: z.string(),
    centerId: z.string().optional(),
  }),
});

export const comparativeReportSchema = z.object({
  query: z.object({
    startDate: z.string(),
    endDate: z.string(),
    groupBy: z.enum(['classId', 'childId']),
    centerId: z.string().optional(),
  }),
});
