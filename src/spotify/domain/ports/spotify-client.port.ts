import { Track } from '../entities/track.entity';
import { Playlist } from '../entities/playlist.entity';

export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images?: Array<{ url: string }>;
}

export abstract class SpotifyClientPort {
  abstract exchangeCodeForTokens(code: string): Promise<SpotifyTokens>;
  abstract refreshTokens(refreshToken: string): Promise<SpotifyTokens>;
  abstract getUserProfile(accessToken: string): Promise<SpotifyUserProfile>;
  abstract getLikedTracks(
    accessToken: string,
    limit?: number,
    offset?: number,
  ): Promise<Track[]>;
  abstract getUserPlaylists(accessToken: string): Promise<Playlist[]>;
  abstract createPlaylist(
    accessToken: string,
    userId: string,
    name: string,
    description?: string,
  ): Promise<Playlist>;
  abstract addTracksToPlaylist(
    accessToken: string,
    playlistId: string,
    trackIds: string[],
  ): Promise<void>;
}
