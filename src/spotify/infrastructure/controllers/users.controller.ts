import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { SpotifyAuthGuard } from '../guards/spotifyAuth.guards';
import type { CustomRequest } from 'src/types/express/express';
import {
  FullSyncSpotifyAccountResult,
  FullSyncSpotifyAccountUseCase,
} from 'src/spotify/application/usecases/synchronise-spotify-profile/full-sync-spotify-account.usecase';

@Controller('me')
@UseGuards(SpotifyAuthGuard)
export class UsersController {
  constructor(
    private readonly syncSpotifyAccountUsecase: FullSyncSpotifyAccountUseCase,
  ) {}

  @Get('fullsync')
  async syncProfile(
    @Req() req: CustomRequest,
  ): Promise<FullSyncSpotifyAccountResult> {
    const accessToken = req.accessToken;

    const result = await this.syncSpotifyAccountUsecase.execute({
      accessToken,
    });

    return result;
  }
}
