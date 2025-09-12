import crypto from 'crypto';

const generateOtp = () => {
  const otp = crypto.randomInt(100000, 999999);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { otp: String(otp), expiresAt };
};

export default generateOtp;
