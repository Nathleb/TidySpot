import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  secret: process.env.SESSION_SECRET,
  cookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE!, 10),
  secure: process.env.NODE_ENV === 'production',
}));
