import { Router } from 'express';
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

//auth routes
route.post(
  '/register',
  validateResource(userRegisterSchema),
  registerUser,
);
route.post('/verify', validateResource(userVerifySchema), verifyUser);
route.post('/login', validateResource(userLoginSchema), loginUser);

route.get('/users', getUsers);
route.get('/users/:id', getUserById);

export default route;
