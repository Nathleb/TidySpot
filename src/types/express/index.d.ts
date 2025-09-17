declare namespace Express {
  interface Request {
    session: {
      spotifyId?: string;
      state?: string;
      codeVerifier?: string;
    };
    spotifySession?: SpotifyAuthSession;
  }
}
