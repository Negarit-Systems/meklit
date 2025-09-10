import { Router } from 'express';
import usersRoute from './usersRoute.js';

const router = Router();

router.use('/api/v1', usersRoute);

export default router;
