import type { Response } from 'express';
import type { ApiResponse } from '../types/types.js';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  statusCode: number = 200,
  data?: T,
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: string,
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };

  res.status(statusCode).json(response);
};
