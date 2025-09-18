import { Controller, Get, Query, Res, HttpStatus, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { SpotifyAuthService } from '../../application/services/spotify-auth.service';

@Controller('auth/spotify')
export class AuthController {
  constructor(private readonly spotifyAuthService: SpotifyAuthService) {}

  @Get('login')
  async login(@Res() res: Response, @Req() req: Request) {
    const { url, codeVerifier, state } =
      await this.spotifyAuthService.getAuthUrl();

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    res.redirect(url);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Access denied',
        description: error,
      });
    }

    if (!state || state !== req.session.state) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Invalid state parameter',
      });
    }

    if (!code) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Missing authorization code',
      });
    }

    try {
      const user = await this.spotifyAuthService.handleCallback(
        code,
        req.session.codeVerifier!,
        req.sessionID,
      );

      delete req.session.codeVerifier;
      delete req.session.state;

      return res.json({
        success: true,
        user: {
          id: user.spotifyId,
          displayName: user.displayName,
          email: user.email,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Authentication failed',
        message: error?.message,
      });
    }
  }
}
