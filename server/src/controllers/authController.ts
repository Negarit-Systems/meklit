import { sendSuccess, sendError } from '../utils/apiResponse.js';
import type { Request, Response } from 'express';
import { UsersService } from '../services/auth.js';
import { config } from '../config/config.js';

const userService = new UsersService();
const { maxAge, nodeEnv } = config();

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    await userService.registerUser(name, email, password);
    sendSuccess(res, 'User registered successfully', 201);
  } catch (error: any) {
    sendError(res, error.message, 400);
  }
};

export const resendOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  try {
    await userService.resendOtp(email);
    sendSuccess(res, 'OTP resent successfully', 200);
  } catch (error: any) {
    sendError(
      res,
      error.message,
      error.message.includes('not found') ? 404 : 400,
    );
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const { accessToken, refreshToken } =
      await userService.verifyUser(email, otp);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: maxAge
        ? parseInt(maxAge) * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccess(res, 'User verified successfully', 200, {
      accessToken,
    });
  } catch (error: any) {
    sendError(
      res,
      error.message,
      error.message.includes('not found') ? 404 : 400,
    );
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const { accessToken, refreshToken } = await userService.loginUser(
      email,
      password,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: maxAge
        ? parseInt(maxAge) * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccess(res, 'User logged in successfully', 200, {
      accessToken,
    });
  } catch (error: any) {
    sendError(
      res,
      error.message,
      error.message.includes('Invalid Credential') ? 401 : 400,
    );
  }
};

export const logoutUser = (req: Request, res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
  });
  sendSuccess(res, 'User logged out successfully', 200);
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return sendError(res, 'No refresh token provided', 401);
  }

  try {
    const { accessToken } =
      await userService.refreshToken(refreshToken);
    sendSuccess(res, 'Access token refreshed successfully', 200, {
      accessToken,
    });
  } catch (error: any) {
    sendError(res, error.message, 401);
  }
};
