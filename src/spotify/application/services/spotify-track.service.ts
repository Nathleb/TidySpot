import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';
import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';
import { TrackDto } from '../dto/track.dto';

@Injectable()
export class SpotifyTrackService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly spotifyTrackClient: SpotifyTrackClientPort,
  ) {}

  async getLikedTracks(accessToken: string): Promise<TrackDto[]> {
    return (await this.spotifyTrackClient.getLikedTracks(accessToken)).map(
      TrackDto.fromEntity,
    );
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
