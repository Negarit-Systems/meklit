import { Router } from 'express';
import { z } from 'zod'; // Import Zod
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

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Creates a new user account. On success, an OTP is sent to the user's email for verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Invalid input provided.
 *       409:
 *         description: A user with this email already exists.
 */
route.post(
  '/register',
  validateResource(z.object({ body: userRegisterSchema })),
  registerUser,
);

/**
 * @swagger
 * /api/v1/verify:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verify a user's email address
 *     description: Verifies a user's account using the OTP sent to their email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User verified successfully.
 *       400:
 *         description: Invalid OTP, or the OTP has expired.
 */
route.post(
  '/verify',
  validateResource(z.object({ body: userVerifySchema })),
  verifyUser,
);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Log in a user
 *     description: Authenticates a user with email and password, and returns a JWT access token upon successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid email or password.
 */
route.post(
  '/login',
  validateResource(z.object({ body: userLoginSchema })),
  loginUser,
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieves a list of all registered users. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *       401:
 *         description: Unauthorized.
 */
route.get('/users', getUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a single user by ID
 *     description: Retrieves the details of a single user by their ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: User details.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */
route.get('/users/:id', getUserById);

export default route;
