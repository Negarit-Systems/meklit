import * as dotenv from 'dotenv';

export const config = () => {
  dotenv.config();

  return {
    port: process.env.PORT || 4001,
    dbUri: process.env.DB_URI,
    jwtSecret: process.env.JWT_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
    firebaseServiceAccountPath:
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH!,
    n8nWebHookURL: process.env.N8N_WEBHOOK_URL!,
  };
};
