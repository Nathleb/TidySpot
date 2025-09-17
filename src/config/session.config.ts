import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  cookieMaxAge:
    parseInt(process.env.SESSION_COOKIE_MAX_AGE!, 10) || 24 * 60 * 60 * 1000, // 24 hours
  secure: process.env.NODE_ENV === 'production',
}));
