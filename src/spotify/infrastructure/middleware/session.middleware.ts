import expressSession from 'express-session';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction, RequestHandler } from 'express';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private sessionMiddleware: RequestHandler;

  constructor(private readonly configService: ConfigService) {
    this.sessionMiddleware = expressSession({
      secret: this.configService.get<string>('session.secret')!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: this.configService.get<boolean>('session.secure'),
        httpOnly: true,
        maxAge: this.configService.get<number>('session.cookieMaxAge'),
        path: '/',
        sameSite: 'lax',
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.sessionMiddleware(req, res, next);
  }
}
