import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const reportRouter = Router();

// Map routes to controller methods
reportRouter.get(
  '/class-summary',
  reportController.getClassSummary,
);

reportRouter.get(
  '/class-comparison',
  reportController.compareClasses,
);

export default reportRouter;
