import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';
import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';
import { SpotifyLikedTrackDto } from '../dto/spotify-liked-track.dto';

@Injectable()
export class SpotifyTrackService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly spotifyTrackClient: SpotifyTrackClientPort,
  ) {}

  async getLikedTracks(accessToken: string): Promise<SpotifyLikedTrackDto[]> {
    return await this.spotifyTrackClient.getLikedTracks(accessToken);
  }

  async addTracksToPlaylist(
    accessToken: string,
    playlistId: string,
    trackUris: string[],
  ): Promise<void> {
    await this.spotifyTrackClient.addTracksToPlaylist(
      accessToken,
      playlistId,
      trackUris,
    );
  }
}
