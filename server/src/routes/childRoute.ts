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

const childRoute = Router();

childRoute.post(
  '/',
  validateResource(childCreateSchema),
  createChild,
);

childRoute.get('/', findChildren);

childRoute.get('/:id', findOneChild);

childRoute.put(
  '/:id',
  validateResource(childUpdateSchema),
  updateChild,
);

childRoute.delete('/:id', deleteChild);

export default childRoute;
