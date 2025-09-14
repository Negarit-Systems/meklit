import { Router } from 'express';
import {
  registerUser,
  verifyUser,
  loginUser,
  refreshToken,
  logoutUser,
  resendOtp,
} from '../controllers/authController.js';
import validateResource from '../middlewares/validateResource.js';
import {
  userLoginSchema,
  userRegisterSchema,
  userResendOtpSchema,
  userVerifySchema,
} from '../models/schema/user.schema.js';
import { authMiddleware } from '../middlewares/auth.js';

const authRoute = Router();

authRoute.post(
  '/register',
  validateResource(userRegisterSchema),
  registerUser,
);
authRoute.post(
  '/verify',
  validateResource(userVerifySchema),
  verifyUser,
);
authRoute.post(
  '/resend-otp',
  validateResource(userResendOtpSchema),
  resendOtp,
);
authRoute.post(
  '/login',
  validateResource(userLoginSchema),
  loginUser,
);
authRoute.post('/refresh-token', refreshToken);
authRoute.post('/logout', authMiddleware, logoutUser);

export default authRoute;
