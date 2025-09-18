import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { SpotifyUserService } from 'src/spotify/application/services/spotify-user.service';
import { SpotifyAuthGuard } from '../guards/spotifyAuth.guards';
import type { CustomRequest } from 'src/types/express/express';

@Controller('users')
@UseGuards(SpotifyAuthGuard)
export class UsersController {
  constructor(private readonly spotifyUserService: SpotifyUserService) {}

  @Get('me')
  async getMyProfile(@Req() req: CustomRequest): Promise<User> {
    const accessToken = req.accessToken;

    const user =
      await this.spotifyUserService.updateUserProfileFromSpotify(accessToken);

    return user;
  }
}
