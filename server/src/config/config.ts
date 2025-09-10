import * as dotenv from 'dotenv';

export const config = () => {
  dotenv.config();

  return {
    port: process.env.PORT || 4001,
    dbUri: process.env.DB_URI,
    jwtSecret: process.env.JWT_SECRET!,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
  };
};
