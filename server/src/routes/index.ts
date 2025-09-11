import { Router } from 'express';
import usersRoute from './usersRoute.js';
import dailyLogRoute from './dailyLogRoute.js';
import healthRecordRoute from './healthRecordRoute.js';

const router = Router();

router.use('/users', usersRoute);
router.use('/daily-logs', dailyLogRoute);
router.use('/health-records', healthRecordRoute);

export default router;
