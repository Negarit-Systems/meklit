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

const usersRoute = Router();

usersRoute.post(
  '/auth/register',
  validateResource(userRegisterSchema),
  registerUser,
);
usersRoute.post(
  '/auth/verify',
  validateResource(userVerifySchema),
  verifyUser,
);
usersRoute.post(
  '/auth/login',
  validateResource(userLoginSchema),
  loginUser,
);
usersRoute.post('/auth/refresh-token', refreshToken);
usersRoute.post('/auth/logout', logoutUser);

export default usersRoute;
