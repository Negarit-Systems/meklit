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
  incidentFrequencyReport,
  staffAnalysisReport,
  timelineReport,
} from '../controllers/healthRecordController.js';

const healthRecordRoute = Router();

healthRecordRoute.get(
  '/incident-frequency',
  validateResource(incidentFrequencySchema),
  incidentFrequencyReport,
);

healthRecordRoute.get(
  '/timeline',
  validateResource(timelineReportSchema),
  timelineReport,
);

healthRecordRoute.get(
  '/child-health-profile',
  validateResource(childHealthProfileSchema),
  childHealthProfile,
);

healthRecordRoute.get(
  '/staff-analysis',
  validateResource(staffAnalysisSchema),
  staffAnalysisReport,
);

healthRecordRoute.get(
  '/action-distribution',
  validateResource(actionDistributionSchema),
  actionDistributionReport,
);

export default healthRecordRoute;
