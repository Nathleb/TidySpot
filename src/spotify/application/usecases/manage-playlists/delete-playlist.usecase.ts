import { Injectable } from '@nestjs/common';
import { SpotifyPlaylistClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-playlist-client.port';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';

export interface DeletePlaylistCommand {
  accessToken: string;
  playlistId: string;
}

@Injectable()
export class DeletePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepositoryPort,
    private readonly spotifyPlaylistClient: SpotifyPlaylistClientPort,
  ) {}

  async execute(command: DeletePlaylistCommand): Promise<void> {
    const { accessToken, playlistId } = command;

    try {
      await this.spotifyPlaylistClient.deletePlaylist(accessToken, playlistId);

      await this.playlistRepository.deletePlaylist(playlistId);
    } catch (error) {
      //differencier error de repo et de spotify
      throw error;
    }
  }
}
