import { Request, Response } from 'express';
import { ClassReportService } from '../services/report.js';

const reportService = new ClassReportService();

export const reportController = {
  // Get a flexible summary grouped by class or center
  async getSummary(req: Request, res: Response) {
    try {
      const { startDate, endDate, centerId, groupBy } = req.query;

      // Validate groupBy parameter to ensure it's one of the expected values
      if (groupBy && groupBy !== 'class' && groupBy !== 'center') {
        return res.status(400).send({
          error:
            "Invalid 'groupBy' parameter. Must be 'class' or 'center'.",
        });
      }

      const options = {
        startDate:
          typeof startDate === 'string' ? startDate : undefined,
        endDate: typeof endDate === 'string' ? endDate : undefined,
        centerId: typeof centerId === 'string' ? centerId : undefined,
        groupBy: groupBy as 'class' | 'center' | undefined,
      };

      const data = await reportService.generateReport(options);
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in getSummary:', error);
      res
        .status(500)
        .send({ error: 'Failed to generate summary report.' });
    }
  },

  // Compare TWO classes (summary)
  async compareClasses(req: Request, res: Response) {
    try {
      const { startDate, endDate, classId1, classId2 } = req.query;
      if (
        typeof classId1 !== 'string' ||
        typeof classId2 !== 'string'
      ) {
        return res.status(400).send({
          error:
            'classId1 and classId2 query parameters are required.',
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
      console.error('Error in compareClasses:', error);
      res.status(500).send({
        error: 'Failed to generate class comparison report.',
      });
    }
  },

  // Compare TWO centers (summary)
  async compareCenters(req: Request, res: Response) {
    try {
      const { startDate, endDate, centerId1, centerId2 } = req.query;
      if (
        typeof centerId1 !== 'string' ||
        typeof centerId2 !== 'string'
      ) {
        return res.status(400).send({
          error:
            'centerId1 and centerId2 query parameters are required.',
        });
      }
      const data = await reportService.compareCentersReport(
        centerId1,
        centerId2,
        typeof startDate === 'string' ? startDate : undefined,
        typeof endDate === 'string' ? endDate : undefined,
      );
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in compareCenters:', error);
      res.status(500).send({
        error: 'Failed to generate center comparison report.',
      });
    }
  },

  async compareChildren(req: Request, res: Response) {
    try {
      const { startDate, endDate, childId1, childId2 } = req.query;
      if (
        typeof childId1 !== 'string' ||
        typeof childId2 !== 'string'
      ) {
        return res.status(400).send({
          error:
            'childId1 and childId2 query parameters are required.',
        });
      }
      const data = await reportService.compareChildrenReport(
        childId1,
        childId2,
        typeof startDate === 'string' ? startDate : undefined,
        typeof endDate === 'string' ? endDate : undefined,
      );
      res.status(200).json(data);
    } catch (error) {
      console.error('Error in compareChildren:', error);
      res.status(500).send({
        error: 'Failed to generate child comparison report.',
      });
    }
  },
};
