import * as session from 'express-session';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: any, res: any, next: () => void) {
    return session({
      secret: this.configService.get<string>('session.secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: this.configService.get<boolean>('session.secure'),
        httpOnly: true,
        maxAge: this.configService.get<number>('session.cookieMaxAge'),
      },
    })(req, res, next);
  }
}
