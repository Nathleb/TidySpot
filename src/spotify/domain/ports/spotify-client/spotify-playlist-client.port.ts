import { Playlist } from '../../entities/playlist.entity';

export abstract class SpotifyPlaylistClientPort {
  abstract getUserPlaylists(accessToken: string): Promise<Playlist[]>;
  abstract createPlaylist(
    accessToken: string,
    userId: string,
    name: string,
    description?: string,
  ): Promise<Playlist>;
}
