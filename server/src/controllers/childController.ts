import { Request, Response } from 'express';
import { Child } from '../models/child.js';
import { QueryOptions } from '../types/query-option.js';
import { ChildService } from '../services/child-service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const childService = new ChildService();

export const createChild = async (req: Request, res: Response) => {
  const child: Child = req.body;
  const createdChild = await childService.create(child);
  if (!createdChild) {
    return sendError(res, 'Failed to create child.', 500);
  }
  sendSuccess(res, 'Child created', 201, createdChild);
};

export const updateChild = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data: Partial<Child> = req.body;
  const updatedChild = await childService.update(id, data);
  if (!updatedChild) {
    return sendError(res, 'Failed to update child.', 500);
  }
  sendSuccess(res, 'Child updated', 200, updatedChild);
};

export const deleteChild = async (req: Request, res: Response) => {
  const id = req.params.id;
  await childService.delete(id);
  sendSuccess(res, 'Child deleted', 204, null);
};

export const findOneChild = async (req: Request, res: Response) => {
  const id = req.params.id;
  const child = await childService.findOne(id);
  if (!child) {
    return sendError(res, 'Child not found.', 404);
  }
  sendSuccess(res, 'Child found', 200, child);
};

export const findChildren = async (req: Request, res: Response) => {
  const queryOptions: QueryOptions = req.query;
  const children = await childService.find(queryOptions);
  if (!children) {
    return sendError(res, 'Failed to fetch children.', 500);
  }
  sendSuccess(res, 'Children fetched', 200, children);
};
