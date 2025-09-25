import { Injectable } from '@nestjs/common';
import { PlaylistTrack } from 'src/spotify/domain/entities/playlist-track.entity';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';
import { PlaylistTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-track-repository.port';
import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';

export interface AddTrackToPlaylistCommand {
  accessToken: string;
  playlistId: string;
  trackId: string;
  userId: string;
}

@Injectable()
export class AddTrackToPlaylistUseCase {
  constructor(
    private readonly playlistRepository: PlaylistRepositoryPort,
    private readonly playlistTrackRepository: PlaylistTrackRepositoryPort,
    private readonly SpotifyTrackClient: SpotifyTrackClientPort,
  ) {}

  async execute(command: AddTrackToPlaylistCommand): Promise<PlaylistTrack> {
    const { accessToken, playlistId, trackId, userId } = command;

    try {
      const playlist =
        await this.playlistRepository.findPlaylistById(playlistId);

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      if (playlist.ownerId !== userId) {
        throw new Error('Unauthorized: Playlist does not belong to user');
      }

      const existingTrack =
        await this.playlistTrackRepository.findByPlaylistIdAndTrackId(
          playlistId,
          trackId,
        );

      if (existingTrack) {
        throw new Error('Track already exists in playlist');
      }

      await this.SpotifyTrackClient.addTracksToPlaylist(
        accessToken,
        playlistId,
        [trackId],
      );

      const playlistTrack = new PlaylistTrack(playlistId, trackId, new Date());

      await this.playlistTrackRepository.addTrackToPlaylist(
        playlistId,
        playlistTrack,
      );

      return playlistTrack;
    } catch (error) {
      // TODO: differentiate between repository errors and spotify errors
      // TODO: Consider rollback strategies if Spotify succeeds but DB fails
      throw error;
    }
  }
}
