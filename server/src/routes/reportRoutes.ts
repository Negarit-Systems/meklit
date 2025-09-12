import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const reportRouter = Router();

// Map routes to controller methods
reportRouter.get(
  '/class-summary',
  reportController.getClassSummary,
);
reportRouter.get(
  '/activity-engagement',
  reportController.getActivityEngagement,
);
reportRouter.get(
  '/class-comparison',
  reportController.compareClasses,
);
reportRouter.get(
  '/activity-comparison',
  reportController.compareActivityEngagement,
);

export default reportRouter;
