import { Users } from '../models/users.js';
import { EntityCrudService } from './entity-crud.js';
import * as bcrypt from 'bcrypt';
import generateOtp from '../utils/otpGenerator.js';
import { sendEmail } from '../utils/email.js';
import admin from 'firebase-admin';
import { otpTemplate } from '../utils/email-templates.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from 'src/utils/auth/jwt.utils.js';

export class UsersService extends EntityCrudService<Users> {
  constructor() {
    super('users');
  }

  async registerUser(
    name: string,
    email: string,
    password: string,
  ): Promise<void> {
    const user = await this.findByEmail(email);
    if (user) {
      throw new Error('User already exists');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const { otp, expiresAt } = generateOtp();
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    await this.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      role: 'Admin',
      hashedOtp,
      otpExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const body = otpTemplate(name, String(otp), 10);
    await sendEmail({
      to: email,
      subject: 'Your OTP Code - Meklit.Life',
      body,
    });
  }

  async resendOtp(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.isVerified) {
      throw new Error('User already verified');
    }

    const { otp, expiresAt } = generateOtp();
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    await this.update(user.id!, {
      hashedOtp,
      otpExpiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const body = otpTemplate(user.name, String(otp), 10);
    await sendEmail({
      to: email,
      subject: 'Your OTP Code - Meklit.Life',
      body,
    });
  }

  async verifyUser(
    email: string,
    otp: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.isVerified) {
      throw new Error('User already verified');
    }
    if (
      !user.hashedOtp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt.toDate() < new Date() ||
      !(await bcrypt.compare(otp.toString(), user.hashedOtp))
    ) {
      throw new Error('Invalid OTP. Please request a new one.');
    }

    await this.update(user.id!, {
      isVerified: true,
      hashedOtp: '',
      updatedAt: admin.firestore.Timestamp.now(),
    });

    const accessToken = generateAccessToken({ id: user.id!, email });
    const refreshToken = generateRefreshToken({ id: user.id! });

    return { accessToken, refreshToken };
  }

  async loginUser(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid Credential');
    }
    if (!user.isVerified) {
      throw new Error('User not verified');
    }

    const accessToken = generateAccessToken({ id: user.id!, email });
    const refreshToken = generateRefreshToken({ id: user.id! });

    return { accessToken, refreshToken };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken) as { id: string };
    } catch (error: any) {
      throw new Error('Invalid refresh token');
    }

    const user = await this.findOne(payload.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = generateAccessToken({
      id: payload.id,
      email: user.email,
    });
    return { accessToken };
  }
}
