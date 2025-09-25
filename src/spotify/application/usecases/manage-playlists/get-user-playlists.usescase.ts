import { Injectable } from '@nestjs/common';
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';
import { SpotifyPlaylistClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-playlist-client.port';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';

export interface GetUserPlaylistsCommand {
  userId: string;
}

@Injectable()
export class GetUserPlaylistsUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepositoryPort,
    private readonly spotifyPlaylistClient: SpotifyPlaylistClientPort,
  ) {}

  async execute(command: GetUserPlaylistsCommand): Promise<Playlist[]> {
    const { userId } = command;

    try {
      return await this.playlistRepository.findAllByOwnerId(userId);
    } catch (error) {
      //todo differencier error de repo et de spotify
      throw error;
    }
  }
}
