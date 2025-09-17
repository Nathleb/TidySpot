import 'express-session';

declare module 'express-session' {
  interface SessionData {
    spotifyId?: string;
    state?: string;
    codeVerifier?: string;
  }
}
