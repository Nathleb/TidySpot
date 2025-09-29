import 'express';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      spotifyId?: string;
    }
  }
}

export interface CustomRequest extends Request {
  accessToken: string;
  spotifyId: string;
}
