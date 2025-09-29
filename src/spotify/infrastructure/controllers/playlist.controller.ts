import { Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SpotifyAuthGuard } from '../guards/spotifyAuth.guards';
import { GetUserPlaylistsUseCase } from 'src/spotify/application/usecases/manage-playlists/get-user-playlists.usescase';
import { DeletePlaylistUseCase } from 'src/spotify/application/usecases/manage-playlists/delete-playlist.usecase';
import { CreatePlaylistUseCase } from 'src/spotify/application/usecases/manage-playlists/create-playlist.usecase';
import { ToggleForSortingPlaylistUseCase } from 'src/spotify/application/usecases/manage-playlists/toggle-playlist-for-sorting.usecase';
import type  { CustomRequest } from 'src/types/express/express';
@Controller('playlists')
@UseGuards(SpotifyAuthGuard)
export class UsersController {
  constructor(
    private readonly getUserPlaylistsUsecase: GetUserPlaylistsUseCase,
    private readonly deletePlaylistsUsecase: DeletePlaylistUseCase,
    private readonly createPlaylistUsecase: CreatePlaylistUseCase,
    private readonly togglePlaylistUsecase: ToggleForSortingPlaylistUseCase,
  ) {}

  @Get()
  async getUserPlaylists(@Req() req: CustomRequest) {
    return this.getUserPlaylistsUsecase.execute({ userId: req.spotifyId });
  }

  @Delete(':playlistId')
  async deletePlaylist(@Req() req: CustomRequest) {
    const accessToken = req.accessToken;
    const playlistId = req.params.playlistId;

    return this.deletePlaylistsUsecase.execute({ accessToken, playlistId });
  }

  @Post()
  async createPlaylist(@Req() req: CustomRequest) {
    const accessToken = req.accessToken;
    const userId = req.spotifyId;

    return this.createPlaylistUsecase.execute({
      accessToken,
      userId,
      req.body
    });
  }

  @Post(':playlistId/toggle-for-sorting')
  async togglePlaylistForSorting(@Req() req: CustomRequest) {
    const playlistId = req.params.playlistId;

    return this.togglePlaylistUsecase.execute({ playlistId });
  }
}
