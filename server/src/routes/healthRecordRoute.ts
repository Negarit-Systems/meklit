import { Router } from 'express';
import validateResource from '../middlewares/validateResource.js';
import {
  actionDistributionSchema,
  childHealthProfileSchema,
  incidentFrequencySchema,
  staffAnalysisSchema,
  timelineReportSchema,
} from '../models/schema/health-record.schema.js';
import {
  actionDistributionReport,
  childHealthProfile,
  findHealthRecords,
  incidentFrequencyReport,
  staffAnalysisReport,
  timelineReport,
} from '../controllers/healthRecordController.js';
import { authMiddleware } from '../middlewares/auth.js';

const healthRecordRoute = Router();

healthRecordRoute.get('/', authMiddleware, findHealthRecords);

// Report Routes
healthRecordRoute.get(
  '/incident-frequency',
  authMiddleware,
  validateResource(incidentFrequencySchema),
  incidentFrequencyReport,
);

healthRecordRoute.get(
  '/timeline',
  authMiddleware,
  validateResource(timelineReportSchema),
  timelineReport,
);

healthRecordRoute.get(
  '/child-health-profile',
  authMiddleware,
  validateResource(childHealthProfileSchema),
  childHealthProfile,
);

healthRecordRoute.get(
  '/staff-analysis',
  authMiddleware,
  validateResource(staffAnalysisSchema),
  staffAnalysisReport,
);

healthRecordRoute.get(
  '/action-distribution',
  authMiddleware,
  validateResource(actionDistributionSchema),
  actionDistributionReport,
);

export default healthRecordRoute;
