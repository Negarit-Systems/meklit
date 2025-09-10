// src/middlewares/validateResource.ts
import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      return sendError(res, 'Invalid request data', 400, e.errors);
    }
  };

export default validateResource;
