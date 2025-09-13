import { z } from 'zod';

export const incidentFrequencySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    centerId: z.string().optional(),
  }),
});

export const timelineReportSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    childId: z.string().optional(),
    centerId: z.string().optional(),
  }),
});

export const childHealthProfileSchema = z.object({
  query: z.object({
    childId: z.string().min(1),
    limit: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const staffAnalysisSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    centerId: z.string().optional(),
  }),
});

export const actionDistributionSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    centerId: z.string().optional(),
  }),
});
