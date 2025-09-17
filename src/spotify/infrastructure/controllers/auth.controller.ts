import { Controller, Get, Query, Res, HttpStatus, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { SpotifyAuthService } from '../../application/services/spotify-auth.service';
import { SpotifyClientPort } from '../../domain/ports/spotify-client.port';

@Controller('auth/spotify')
export class AuthController {
  constructor(
    private readonly spotifyAuthService: SpotifyAuthService,
    private readonly spotifyClient: SpotifyClientPort,
  ) {}

  @Get('login')
  async login(@Res() res: Response, @Req() req: Request) {
    const { url, codeVerifier, state } =
      await this.spotifyAuthService.getAuthUrl();

    req.session.codeVerifier = codeVerifier;
    req.session.state = state;

    return res.redirect(url);
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        message: error?.message,
      });
    }
  }

  // @Get('me')
  // @UseGuards(SpotifyAuthGuard)
  // async getProfile(@Req() req: Request) {
  //   const session = (req as any).spotifySession;
  //   const profile = await this.spotifyClient.getUserProfile(
  //     session.accessToken,
  //   );

  //   return {
  //     id: profile.id,
  //     displayName: profile.displayName,
  //     email: profile.email,
  //     profileImage: profile.images?.[0]?.url,
  //   };
  // }
}
