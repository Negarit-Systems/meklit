import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/auth.js';

const reportRouter = Router();

// Flexible summary route (groups by class or center)
reportRouter.get(
  '/summary',
  authMiddleware,
  reportController.getSummary,
);

// Compares two specific classes
reportRouter.get(
  '/class-comparison',
  authMiddleware,
  reportController.compareClasses,
);

// Compares two specific centers
reportRouter.get(
  '/center-comparison',
  authMiddleware,
  reportController.compareCenters,
);

// Compares two children
reportRouter.get(
  '/child-comparison',
  authMiddleware,
  reportController.compareChildren,
);

export default reportRouter;
