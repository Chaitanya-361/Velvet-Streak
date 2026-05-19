import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '30d',
  CORS_ALLOWED_ORIGINS: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev-cookie-secret',
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
};
