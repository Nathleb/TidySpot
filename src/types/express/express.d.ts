import 'express';

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      spotifyId?: string;
    }
  }
}

export interface CustomRequest extends ExpressRequest {
  accessToken: string;
  spotifyId: string;
}
