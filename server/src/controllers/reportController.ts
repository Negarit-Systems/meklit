import { Request, Response } from 'express';
import { ClassReportService } from '../services/report.js';

const reportService = new ClassReportService();

export const reportController = {
  // 1. Get summary for ALL classes
  async getClassSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      if (
        typeof startDate !== 'string' ||
        typeof endDate !== 'string'
      ) {
        return res
          .status(400)
          .send({ error: 'startDate and endDate are required.' });
      }
      const data = await reportService.generateReport(
        startDate,
        endDate,
      );
      res.status(200).json(data);
    } catch (error) {
      res
        .status(500)
        .send({ error: 'Failed to generate class summary report.' });
    }
  },

  // 2. Get activity engagement (all classes or one class)
  async getActivityEngagement(req: Request, res: Response) {
    try {
      const { startDate, endDate, centerId } = req.query;
      if (
        typeof startDate !== 'string' ||
        typeof endDate !== 'string'
      ) {
        return res
          .status(400)
          .send({ error: 'startDate and endDate are required.' });
      }
      const data = await reportService.activityEngagementReport(
        startDate,
        endDate,
        centerId as string | undefined,
      );
      res.status(200).json(data);
    } catch (error) {
      res
        .status(500)
        .send({
          error: 'Failed to generate activity engagement report.',
        });
    }
  },

  // 3. Compare TWO classes (summary)
  async compareClasses(req: Request, res: Response) {
    try {
      const { startDate, endDate, classId1, classId2 } = req.query;
      if (
        typeof startDate !== 'string' ||
        typeof endDate !== 'string' ||
        typeof classId1 !== 'string' ||
        typeof classId2 !== 'string'
      ) {
        return res
          .status(400)
          .send({
            error:
              'startDate, endDate, classId1, and classId2 are required.',
          });
      }
      const data = await reportService.compareClassesReport(
        startDate,
        endDate,
        classId1,
        classId2,
      );
      res.status(200).json(data);
    } catch (error) {
      res
        .status(500)
        .send({
          error: 'Failed to generate class comparison report.',
        });
    }
  },

  // 4. Compare TWO classes (activity engagement)
  async compareActivityEngagement(req: Request, res: Response) {
    try {
      const { startDate, endDate, classId1, classId2 } = req.query;
      if (
        typeof startDate !== 'string' ||
        typeof endDate !== 'string' ||
        typeof classId1 !== 'string' ||
        typeof classId2 !== 'string'
      ) {
        return res
          .status(400)
          .send({
            error:
              'startDate, endDate, classId1, and classId2 are required.',
          });
      }
      const data = await reportService.compareActivityEngagement(
        startDate,
        endDate,
        classId1,
        classId2,
      );
      res.status(200).json(data);
    } catch (error) {
      res
        .status(500)
        .send({
          error: 'Failed to generate activity comparison report.',
        });
    }
  },
};
