import { Router } from 'express';
import authRoute from './authRoute.js';
import dailyLogRoute from './dailyLogRoute.js';
import healthRecordRoute from './healthRecordRoute.js';
import childRoute from './childRoute.js';
import reportRouter from './reportRoutes.js';

const router = Router();

router.use('/auth', authRoute);
router.use('/child', childRoute);
router.use('/daily-logs', dailyLogRoute);
router.use('/health-records', healthRecordRoute);
router.use('/reports', reportRouter);

export default router;
