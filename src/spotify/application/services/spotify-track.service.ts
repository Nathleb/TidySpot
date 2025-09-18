import { Injectable } from '@nestjs/common';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';
import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';
import { Track } from 'src/spotify/domain/entities/track.entity';
import { User } from 'src/spotify/domain/entities/user.entity';

@Injectable()
export class SpotifyTrackService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly spotifyTrackClient: SpotifyTrackClientPort,
  ) {}

  async getLikedTracks(accessToken: string): Promise<Track[]> {
    return await this.spotifyTrackClient.getLikedTracks(accessToken);
  }

  async saveLikedTracksToUser(
    accessToken: string,
    spotifyId: string,
  ): Promise<User> {
    const user = await this.userRepository.findBySpotifyId(spotifyId);
    if (!user) {
      throw new Error('User not found');
    }

    // const likedTracks = await this.getLikedTracks(accessToken);
    // user.likedTracks = likedTracks;

    return await this.userRepository.saveOrUpdate(user);
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
