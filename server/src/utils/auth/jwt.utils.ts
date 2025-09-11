import jwt from 'jsonwebtoken';
import { config } from '../../config/config.js';

const { jwtSecret, refreshTokenSecret } = config();

export const generateAccessToken = (user: { id: string }) => {
  return jwt.sign({ id: user.id }, jwtSecret, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (user: { id: string }) => {
  return jwt.sign({ id: user.id }, refreshTokenSecret, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, refreshTokenSecret);
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};
