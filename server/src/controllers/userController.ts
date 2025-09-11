import { sendSuccess, sendError } from '../utils/apiResponse.js';
import type { Request, Response } from 'express';
import { UsersService } from '../services/users.js';
import admin from 'firebase-admin';

import * as bcrypt from 'bcrypt';
import {
  CreateUserInputSchema,
  UserLoginInputSchema,
  UserVerifyInputSchema,
} from '../models/schema/user.schema.js';
import generateOtp from '../utils/otpGenerator.js';
import { sendEmail } from '../utils/email.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/auth/jwt.utils.js';
import { config } from 'src/config/config.js';
import { otpTemplate } from 'src/utils/email-templates.js';

const userService = new UsersService();
const { maxAge, nodeEnv } = config();

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, email, password }: CreateUserInputSchema = req.body;

  const user = await userService.findByEmail(email);
  if (user) {
    return sendError(res, 'User already exists', 400);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const { otp, expiresAt } = generateOtp();
  const hashedOtp = await bcrypt.hash(otp.toString(), 10);

  await userService.create({
    name,
    email,
    password: hashedPassword,
    isVerified: false,
    role: 'Admin',
    hashedOtp,
    otpExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  const body = otpTemplate(name, String(otp), 10);

  await sendEmail({
    to: email,
    subject: 'Your OTP Code - Meklit.Life',
    body,
  });

  sendSuccess(res, 'User registered successfully', 201);
};

export const verifyUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, otp }: UserVerifyInputSchema = req.body;

  const user = await userService.findByEmail(email);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  if (user.isVerified) {
    return sendError(res, 'User already verified', 400);
  }

  if (
    !user.hashedOtp ||
    !user.otpExpiresAt ||
    user.otpExpiresAt.toDate() < new Date() ||
    !(await bcrypt.compare(otp.toString(), user.hashedOtp))
  ) {
    return sendError(
      res,
      'Invalid OTP. Please request a new one.',
      400,
    );
  }

  await userService.update(user.id ?? '', {
    isVerified: true,
    hashedOtp: undefined,
    otpExpiresAt: undefined,
    updatedAt: admin.firestore.Timestamp.now(),
  });

  const accessToken = generateAccessToken({
    id: user.id as string,
  });
  const refreshToken = generateRefreshToken({
    id: user.id as string,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: maxAge
      ? parseInt(maxAge) * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, 'User verified successfully', 200, {
    accessToken,
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password }: UserLoginInputSchema = req.body;

  const user = await userService.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return sendError(res, 'Invalid Credential', 401);
  }

  if (!user.isVerified) {
    return sendError(res, 'User not verified', 401);
  }

  const accessToken = generateAccessToken({
    id: user.id ?? '',
  });
  const refreshToken = generateRefreshToken({ id: user.id ?? '' });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, 'User logged in successfully', 200, {
    accessToken,
  });
};

export const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  sendSuccess(res, 'User logged out successfully', 200);
};

export const refreshToken = (req: Request, res: Response): void => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return sendError(res, 'No refresh token provided', 401);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken) as { id: string };
  } catch (error) {
    return sendError(res, 'Invalid refresh token', 401);
  }

  const accessToken = generateAccessToken({
    id: payload.id,
  });

  sendSuccess(res, 'Access token refreshed successfully', 200, {
    accessToken,
  });
};
