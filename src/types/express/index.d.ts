declare namespace Express {
  interface Request {
    session: {
      userId?: string;
      state?: string;
      codeVerifier?: string;
    };
  }
}
