export interface Users {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'Staff' | 'Parent';
  isVerified?: boolean;
  refreshToken?: string;
  hashedOtp?: string;
  otpExpiresAt?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
