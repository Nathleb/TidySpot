import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SpotifyAuthGuard } from '../guards/spotifyAuth.guards';
import type { CustomRequest } from 'src/types/express/express';
import {
  SyncSpotifyAccountResult,
  SyncSpotifyAccountUseCase,
} from 'src/spotify/application/usecases/synchronise-spotify-profile/sync-spotify-account.usecase';

@Controller('me')
@UseGuards(SpotifyAuthGuard)
export class UsersController {
  constructor(
    private readonly syncSpotifyAccountUsecase: SyncSpotifyAccountUseCase,
  ) {}

  @Get('sync')
  async syncProfile(
    @Req() req: CustomRequest,
  ): Promise<SyncSpotifyAccountResult> {
    const accessToken = req.accessToken;

    const result = await this.syncSpotifyAccountUsecase.execute({
      accessToken,
    });

    return result;
  }
}
