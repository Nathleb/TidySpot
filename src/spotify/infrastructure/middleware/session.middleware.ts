import expressSession from 'express-session';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private sessionMiddleware: RequestHandler;

  constructor(private readonly configService: ConfigService) {
    const redisClient = createClient({
      url: this.configService.get<string>('REDIS_URL'),
    });

    redisClient.connect().catch(console.error);

    const redisStore = new RedisStore({
      client: redisClient,
      prefix: 'tidyspot:',
    });

    this.sessionMiddleware = expressSession({
      store: redisStore,
      secret: this.configService.get<string>('session.secret')!,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60000,
        path: '/',
        sameSite: 'lax',
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.sessionMiddleware(req, res, () => {
      console.log('Cookies:', req.headers.cookie);
      console.log('Session ID:', req.sessionID);
      console.log('Session data:', req.session);
      next();
    });
  }
}
