import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';

const reportRouter = Router();

// 1. MODIFIED: Flexible summary route (groups by class or center)
reportRouter.get('/summary', reportController.getSummary);

// 2. UNCHANGED: Compares two specific classes
reportRouter.get(
  '/class-comparison',
  reportController.compareClasses,
);

// 3. NEW: Compares two specific centers
reportRouter.get(
  '/center-comparison',
  reportController.compareCenters,
);

export default reportRouter;
