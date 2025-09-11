// src/spotify/infrastructure/controllers/auth.controller.ts
import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { SpotifyAuthService } from '../../application/services/spotify-auth.service';

@Controller('auth/spotify')
export class AuthController {
  constructor(private readonly spotifyAuthService: SpotifyAuthService) {}

  @Get('login')
  login(@Res() res: Response) {
    const authUrl = this.spotifyAuthService.getAuthUrl();
    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Access denied',
        description: error,
      });
    }

    if (!code) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: 'Missing authorization code',
      });
    }

    try {
      const user = await this.spotifyAuthService.handleCallback(code, state);

      // In a real app, you'd create a JWT token here and set it as an httpOnly cookie
      // For now, we'll just return user info
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
  // async getProfile() {
  //   // This endpoint would be protected by an auth guard
  //   // and return the current user's profile
  //   return { message: 'This endpoint needs auth guard implementation' };
  // }
}
