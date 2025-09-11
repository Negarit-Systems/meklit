import { Router } from 'express';
import { z } from 'zod'; 
import {
  getUsers,
  getUserById,
  registerUser,
  verifyUser,
  loginUser,
} from '../controllers/userController.js';
import validateResource from '../middlewares/validateResource.js';
import {
  userLoginSchema,
  userRegisterSchema,
  userVerifySchema,
} from '../models/schema/user.schema.js';

const route = Router();

route.post(
  '/register',
  validateResource(z.object({ body: userRegisterSchema })),
  registerUser,
);

route.post(
  '/verify',
  validateResource(z.object({ body: userVerifySchema })),
  verifyUser,
);

route.post(
  '/login',
  validateResource(z.object({ body: userLoginSchema })),
  loginUser,
);

route.get('/users', getUsers);

route.get('/users/:id', getUserById);

export default route;
