import { Router } from 'express';
import { z } from 'zod';
import {
  registerUser,
  verifyUser,
  loginUser,
  refreshToken,
  logoutUser,
} from '../controllers/userController.js';
import validateResource from '../middlewares/validateResource.js';
import {
  userLoginSchema,
  userRegisterSchema,
  userVerifySchema,
} from '../models/schema/user.schema.js';

const route = Router();

route.post(
  '/auth/register',
  validateResource(userRegisterSchema),
  registerUser,
);
route.post(
  '/auth/verify',
  validateResource(userVerifySchema),
  verifyUser,
);
route.post(
  '/auth/login',
  validateResource(userLoginSchema),
  loginUser,
);
route.post('/auth/refresh-token', refreshToken);
route.post('/auth/logout', logoutUser);

export default route;
