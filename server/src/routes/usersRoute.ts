import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/userController';

const route = Router();

route.get('/users', getUsers);
route.get('/users/:id', getUserById);

export default route;
