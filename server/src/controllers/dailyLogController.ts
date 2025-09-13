import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { DailyLogService } from '../services/daily-log.js';
import { QueryOptions } from '../types/query-option.js';

const dailyLogService = new DailyLogService();

export const findDailyLogs = async (req: Request, res: Response) => {
  const { where, orderBy, limit, startAfter } = req.query;

  // Parse query parameters if needed
  let queryOptions: QueryOptions = {};
  if (where) queryOptions.where = JSON.parse(where as string);
  if (orderBy) queryOptions.orderBy = JSON.parse(orderBy as string);
  if (limit) queryOptions.limit = Number(limit);
  if (startAfter) queryOptions.startAfter = startAfter;

  const dailyLogs = await dailyLogService.find(queryOptions);
  sendSuccess(res, 'Daily logs fetched', 200, dailyLogs);
};

export const trendOverTimeReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { startDate, endDate, childId, classId, centerId } =
    req.query;
  const result = await dailyLogService.trendOverTimeReport(
    startDate ? String(startDate) : undefined,
    endDate ? String(endDate) : undefined,
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
    startDate ? String(startDate) : undefined,
    endDate ? String(endDate) : undefined,
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
    groupBy as 'classId' | 'childId',
    startDate ? String(startDate) : undefined,
    endDate ? String(endDate) : undefined,
    centerId as string,
  );
  sendSuccess(res, 'Comparative report generated', 200, result);
};
