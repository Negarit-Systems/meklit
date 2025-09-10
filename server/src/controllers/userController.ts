import { STATUS_CODES } from 'http';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import type { Request, Response } from 'express';
import { UsersService } from '../services/users.js';
import admin from 'firebase-admin';
// admin.firestore.FieldValue.serverTimestamp();

import * as bcrypt from 'bcrypt';
import { UserRegisterInput } from '../models/schema/user.schema.js';

const userService = new UsersService();

export const getUsers = (req: Request, res: Response): void => {
  const count = parseInt(req.query.count as string) || 5;
  const users = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
  }));

  sendSuccess(res, 'Users fetched successfully', 200, users);
};

export const getUserById = (req: Request, res: Response): void => {
  const id = parseInt(req.params.id);
  const users = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
  }));
  const user = users.find((u) => u.id === id);

  if (user) {
    sendSuccess(res, 'User fetched successfully', 200, user);
  } else {
    sendError(res, 'User not found', 404);
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, email, password }: UserRegisterInput = req.body;

  //check if user already exists with email
  const userExists = await userService.findByEmail(email);
  if (userExists) {
    return sendError(res, 'User already exists', 400);
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = await userService.create({
    name,
    email,
    password: hashedPassword,
    isVerified: false,
    role: 'Admin',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  });

  //send otp via email

  sendSuccess(res, 'User registered successfully', 201);
};

export const verifyUser = (req: Request, res: Response): void => {
  const { email, otp } = req.body;

  //verify otp if user is not verified

  //generate jwt token and refreshToken

  sendSuccess(res, 'User verified successfully', 200);
};

export const loginUser = (req: Request, res: Response): void => {
  const { email, password } = req.body;

  //check if user exists with email and password

  //generate jwt token and refreshToken

  sendSuccess(res, 'User logged in successfully', 200);
};
