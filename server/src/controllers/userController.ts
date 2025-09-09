import { sendSuccess, sendError } from '../utils/apiResponse';
import { Request, Response } from 'express';

export const getUsers = (req: Request, res: Response): void => {
  const count = parseInt(req.query.count as string) || 5;
  const users = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
  }));

  sendSuccess(res, 'Users fetched successfully', users);
};

export const getUserById = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);
  const users = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
  }));
  const user = users.find((u) => u.id === id);

  if (user) {
    sendSuccess(res, 'User fetched successfully', user);
  } else {
    sendError(res, 'User not found', 404);
  }
};
