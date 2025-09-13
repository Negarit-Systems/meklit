import { Request, Response } from 'express';
import { ClassReportService } from '../services/report.js';

const reportService = new ClassReportService();

export const reportController = {
  // 1. Get summary for ALL classes
  async getClassSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const data = await reportService.generateReport(
        typeof startDate === 'string' ? startDate : undefined,
        typeof endDate === 'string' ? endDate : undefined,
      );
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in getClassSummary:', error); // Good practice to log the actual error
      res
        .status(500)
        .send({ error: 'Failed to generate class summary report.' });
    }
  },

  // 2. Compare TWO classes (summary)
  async compareClasses(req: Request, res: Response) {
    try {
      const { startDate, endDate, classId1, classId2 } = req.query;
      if (
        typeof classId1 !== 'string' ||
        typeof classId2 !== 'string'
      ) {
        return res.status(400).send({
          error: 'classId1 and classId2 are required.',
        });
      }
      const data = await reportService.compareClassesReport(
        classId1,
        classId2,
        typeof startDate === 'string' ? startDate : undefined,
        typeof endDate === 'string' ? endDate : undefined,
      );
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in compareClasses:', error); // Good practice to log the actual error
      res.status(500).send({
        error: 'Failed to generate class comparison report.',
      });
    }
  },
};
