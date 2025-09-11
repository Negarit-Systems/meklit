import { Router } from 'express';
import usersRoute from './usersRoute.js';

const router = Router();

router.use('/users', usersRoute);

export default router;
