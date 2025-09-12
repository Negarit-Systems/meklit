import { Router } from 'express';
import {
  comparativeReport,
  findDailyLogs,
  staffPerformanceReport,
  trendOverTimeReport,
} from '../controllers/dailyLogController.js';
import validateResource from '../middlewares/validateResource.js';
import {
  comparativeReportSchema,
  staffPerformanceSchema,
  trendOverTimeSchema,
} from '../models/schema/daily-log.schema.js';

const dailyLogRoute = Router();

dailyLogRoute.get('/', findDailyLogs);

// Report Routes
dailyLogRoute.get(
  '/trend-over-time',
  validateResource(trendOverTimeSchema),
  trendOverTimeReport,
);

dailyLogRoute.get(
  '/staff-performance',
  validateResource(staffPerformanceSchema),
  staffPerformanceReport,
);

dailyLogRoute.get(
  '/comparative',
  validateResource(comparativeReportSchema),
  comparativeReport,
);

export default dailyLogRoute;
