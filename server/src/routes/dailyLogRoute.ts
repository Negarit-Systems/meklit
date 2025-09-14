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
import { authMiddleware } from '../middlewares/auth.js';

const dailyLogRoute = Router();

dailyLogRoute.get('/', authMiddleware, findDailyLogs);

// Report Routes
dailyLogRoute.get(
  '/trend-over-time',
  authMiddleware,
  validateResource(trendOverTimeSchema),
  trendOverTimeReport,
);

dailyLogRoute.get(
  '/staff-performance',
  authMiddleware,
  validateResource(staffPerformanceSchema),
  staffPerformanceReport,
);

dailyLogRoute.get(
  '/comparative',
  authMiddleware,
  validateResource(comparativeReportSchema),
  comparativeReport,
);

export default dailyLogRoute;
