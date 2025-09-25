import { Injectable } from '@nestjs/common';
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';
import { SpotifyPlaylistClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-playlist-client.port';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';

export interface CreatePlaylistCommand {
  accessToken: string;
  userId: string;
  playlist: {
    name: string;
    description?: string;
  };
}

@Injectable()
export class CreatePlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepositoryPort,
    private readonly spotifyPlaylistClient: SpotifyPlaylistClientPort,
  ) {}

  async execute(command: CreatePlaylistCommand): Promise<Playlist> {
    const { accessToken, userId, playlist } = command;
    const { name, description } = playlist;

    try {
      const spotifyPlaylist = await this.spotifyPlaylistClient.createPlaylist(
        accessToken,
        userId,
        name,
        description,
      );

      const playlistEntity = Playlist.fromSpotifyPlaylist(spotifyPlaylist);
      await this.playlistRepository.saveUserPlaylists(userId, [playlistEntity]);

      return playlistEntity;
    } catch (error) {
      //differencier error de repo et de spotify
      throw error;
    }
  }
}
