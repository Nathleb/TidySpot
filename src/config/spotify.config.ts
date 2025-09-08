import { registerAs } from '@nestjs/config';

export default registerAs('spotify', () => ({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  accountUrl: process.env.SPOTIFY_ACCOUNT_URL,
  apiUrl: process.env.SPOTIFY_API_URL,
  scopes: [
    'user-library-read',
    'playlist-read-private',
    'playlist-modify-private',
    'playlist-modify-public',
    'user-read-email',
    'user-read-private',
  ].join(' '),
}));
