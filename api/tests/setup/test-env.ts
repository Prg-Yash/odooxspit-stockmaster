import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Override with test database URL if provided
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Export configuration for tests
export const testConfig = {
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'test-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
  port: process.env.PORT || '8000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
