import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  sendError(res, 'Internal Server Error', 500, err.message);
};
export default errorHandler;
