import { Router } from 'express';
import validateResource from '../middlewares/validateResource.js';
import {
  childCreateSchema,
  childUpdateSchema,
} from '../models/schema/child.schema.js';
import {
  createChild,
  deleteChild,
  findChildren,
  findOneChild,
  updateChild,
} from '../controllers/childController.js';
import { authMiddleware } from '../middlewares/auth.js';

const childRoute = Router();

childRoute.post(
  '/',
  authMiddleware,
  validateResource(childCreateSchema),
  createChild,
);

childRoute.get('/', authMiddleware, findChildren);

childRoute.get('/:id', authMiddleware, findOneChild);

childRoute.put(
  '/:id',
  authMiddleware,
  validateResource(childUpdateSchema),
  updateChild,
);

childRoute.delete('/:id', authMiddleware, deleteChild);

export default childRoute;
