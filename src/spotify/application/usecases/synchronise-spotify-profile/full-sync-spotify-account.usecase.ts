import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';
import { SpotifyUserClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-user-client.port';
import { PlaylistTrack } from 'src/spotify/domain/entities/playlist-track.entity';
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';
import { SpotifyPlaylistClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-playlist-client.port';
import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';
import { LikedTrack } from 'src/spotify/domain/entities/liked-track.entity';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';
import { PlaylistTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-track-repository.port';
import { LikedTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/liked-track-repository.port';

export interface FullSyncSpotifyAccountCommand {
  accessToken: string;
}

export interface FullSyncSpotifyAccountResult {
  user: User;
  playlistsCount: number;
  LikedTracks: number;
  syncedAt: Date;
}

// TODO SyncMetadataEntity, stocker la date de dernier sync, nb d'elements, etc...
@Injectable()
export class FullSyncSpotifyAccountUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly playlistRepository: PlaylistRepositoryPort,
    private readonly playlistTrackRepository: PlaylistTrackRepositoryPort,
    private readonly likedTrackRepository: LikedTrackRepositoryPort,
    private readonly spotifyUserClient: SpotifyUserClientPort,
    private readonly spotifyPlaylistClient: SpotifyPlaylistClientPort,
    private readonly spotifyTrackClient: SpotifyTrackClientPort,
  ) {}

  async execute(
    command: FullSyncSpotifyAccountCommand,
  ): Promise<FullSyncSpotifyAccountResult> {
    const { accessToken } = command;

    const spotifyProfile =
      await this.spotifyUserClient.getUserProfile(accessToken);
    const user = User.fromSpotifyUserProfile(spotifyProfile);
    await this.userRepository.saveOrUpdate(user);

    const spotifyPlaylists = await this.spotifyPlaylistClient.getUserPlaylists(
      accessToken,
      user.id,
    );
    const playlists = spotifyPlaylists.map((playlist) =>
      Playlist.fromSpotifyPlaylist(playlist),
    );

    await this.playlistRepository.saveMany(playlists);
    const playlistsCount = playlists.length;

    const spotifyLikedTracks =
      await this.spotifyTrackClient.getAllUserLikedTracks(accessToken);
    const likedTracks = spotifyLikedTracks.map((savedTrack) =>
      LikedTrack.fromSpotifyLikedTrack(savedTrack, user.id),
    );

    await this.likedTrackRepository.saveUserLikedSongs(user.id, likedTracks);
    const LikedTracks = likedTracks.length;

    for (const playlist of playlists) {
      if (playlist.isOwnedBy(user.id)) {
        const playlistTracks = await this.spotifyTrackClient.getPlaylistTracks(
          accessToken,
          playlist.id,
        );

        const tracks = playlistTracks.map((track) =>
          PlaylistTrack.fromSpotifyPlaylistTrack(track, playlist.id),
        );
        await this.playlistTrackRepository.replaceAllPlaylistTracks(
          playlist.id,
          tracks,
        );
      }
    }

    return {
      user,
      playlistsCount,
      LikedTracks,
      syncedAt: new Date(),
    };
  }
}
