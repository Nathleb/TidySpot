import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { SpotifyAuthGuard } from '../guards/spotifyAuth.guards';
import type { CustomRequest } from 'src/types/express/express';
import { SyncSpotifyAccountUsecase } from 'src/spotify/application/usecases/synchronise-spotify-profile/sync-spotify-account.usecase';

@Controller('me')
@UseGuards(SpotifyAuthGuard)
export class UsersController {
  constructor(
    private readonly syncSpotifyAccountUsecase: SyncSpotifyAccountUsecase,
  ) {}

  @Get('sync')
  async syncProfile(@Req() req: CustomRequest): Promise<User> {
    const accessToken = req.accessToken;

    const user = await this.syncSpotifyAccountUsecase.execute({
      accessToken,
    });

    return user;
  }
}
