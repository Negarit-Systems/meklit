import { Router } from 'express';
import authRoute from './authRoute.js';
import dailyLogRoute from './dailyLogRoute.js';
import healthRecordRoute from './healthRecordRoute.js';
import childRoute from './childRoute.js';

const router = Router();

router.use('/auth', authRoute);
router.use('/child', childRoute);
router.use('/daily-logs', dailyLogRoute);
router.use('/health-records', healthRecordRoute);

export default router;
