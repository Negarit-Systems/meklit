import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth/jwt.utils.js';
import { sendError } from '../utils/apiResponse.js';

export const authMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return sendError(res, 'No token provided', 401);
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, error.message, 401, error.message);
  }
};
