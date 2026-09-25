import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_VERSION: process.env.API_VERSION || 'v1',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  DATABASE_URL:
    process.env.DATABASE_URL ||
    'mongodb://localhost:27017/mahakal_classes?authSource=admin',

  JWT_ACCESS_SECRET:
    process.env.JWT_ACCESS_SECRET || 'mahakal_super_secret_access_jwt_key_2026',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'mahakal_super_secret_refresh_jwt_key_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  GRIDFS_BUCKET_NAME: process.env.GRIDFS_BUCKET_NAME || 'uploads',

  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5000')
    .split(',')
    .map((origin) => origin.trim()),

  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '900000',
    10
  ),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),

  // Master Admin Account
  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin Mahakal Classes',
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'admin@mahakalclasses.com').toLowerCase(),
  ADMIN_MOBILE: process.env.ADMIN_MOBILE || '8511896896',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',
};
