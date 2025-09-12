import { Request, Response } from 'express';
import { HealthRecordService } from '../services/health-record.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { QueryOptions } from '../types/query-option.js';

const healthRecordService = new HealthRecordService();

export const findHealthRecords = async (
  req: Request,
  res: Response,
) => {
  const { where, orderBy, limit, startAfter } = req.query;

  // Parse query parameters if needed
  let queryOptions: QueryOptions = {};
  if (where) queryOptions.where = JSON.parse(where as string);
  if (orderBy) queryOptions.orderBy = JSON.parse(orderBy as string);
  if (limit) queryOptions.limit = Number(limit);
  if (startAfter) queryOptions.startAfter = startAfter;

  const dailyHealthRecords =
    await healthRecordService.find(queryOptions);

  sendSuccess(res, 'Daily logs fetched', 200, dailyHealthRecords);
};

export const incidentFrequencyReport = async (
  req: Request,
  res: Response,
) => {
  const { startDate, endDate, centerId } = req.query;
  healthRecordService
    .incidentFrequencyReport(
      startDate as string,
      endDate as string,
      centerId as string | undefined,
    )
    .then((data) => res.json(data))
    .catch(() =>
      res.status(500).json({
        error: 'Failed to generate incident frequency report.',
      }),
    );
};

export const timelineReport = async (req: Request, res: Response) => {
  const { startDate, endDate, childId, centerId } = req.query;
  healthRecordService
    .timelineReport(
      startDate as string,
      endDate as string,
      childId as string | undefined,
      centerId as string | undefined,
    )
    .then((data) => res.json(data))
    .catch(() =>
      res
        .status(500)
        .json({ error: 'Failed to generate timeline report.' }),
    );
};

export const childHealthProfile = async (
  req: Request,
  res: Response,
) => {
  const { childId, limit, startDate, endDate } = req.query;
  healthRecordService
    .childHealthProfile(
      childId as string,
      Number(limit),
      startDate as string,
      endDate as string,
    )
    .then((data) => res.json(data))
    .catch(() =>
      res.status(500).json({
        error: 'Failed to generate child health profile.',
      }),
    );
};

export const staffAnalysisReport = async (
  req: Request,
  res: Response,
) => {
  const { startDate, endDate, centerId } = req.query;
  healthRecordService
    .staffAnalysisReport(
      startDate as string,
      endDate as string,
      centerId as string | undefined,
    )
    .then((data) => res.json(data))
    .catch(() =>
      res.status(500).json({
        error: 'Failed to generate staff analysis report.',
      }),
    );
};

export const actionDistributionReport = async (
  req: Request,
  res: Response,
) => {
  const { startDate, endDate, centerId } = req.query;
  healthRecordService
    .actionDistributionReport(
      startDate as string,
      endDate as string,
      centerId as string | undefined,
    )
    .then((data) => res.json(data))
    .catch(() =>
      res.status(500).json({
        error: 'Failed to generate action distribution report.',
      }),
    );
};
