import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { DailyLogService } from '../services/daily-log.js';

const dailyLogService = new DailyLogService();

export const findDailyLogs = async (req: Request, res: Response) => {
  const dailyLogs = await dailyLogService.find();
  if (!dailyLogs) {
    return sendError(res, 'Failed to fetch dailyLogs.', 500);
  }
  sendSuccess(res, 'Daily logs fetched', 200, dailyLogs);
};

export const trendOverTimeReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { startDate, endDate, childId, classId, centerId } =
    req.query;
  const result = await dailyLogService.trendOverTimeReport(
    startDate as string,
    endDate as string,
    {
      childId: childId as string,
      classId: classId as string,
      centerId: centerId as string,
    },
  );
  sendSuccess(res, 'Trend over time report generated', 200, result);
};

export const staffPerformanceReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { startDate, endDate, centerId } = req.query;
  const result = await dailyLogService.staffPerformanceReport(
    startDate as string,
    endDate as string,
    centerId as string,
  );
  sendSuccess(res, 'Staff performance report generated', 200, result);
};

export const comparativeReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { startDate, endDate, groupBy, centerId } = req.query;
  if (groupBy !== 'classId' && groupBy !== 'childId') {
    return sendError(res, 'Invalid groupBy value', 400);
  }
  const result = await dailyLogService.comparativeReport(
    startDate as string,
    endDate as string,
    groupBy as 'classId' | 'childId',
    centerId as string,
  );
  sendSuccess(res, 'Comparative report generated', 200, result);
};
