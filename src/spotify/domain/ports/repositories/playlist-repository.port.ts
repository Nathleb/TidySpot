import { Playlist } from '../../entities/playlist.entity';

export abstract class PlaylistRepositoryPort {
  abstract saveUserPlaylists(
    userId: string,
    playlists: Playlist[],
  ): Promise<void>;
  abstract findUserPlaylists(userId: string): Promise<Playlist[]>;
  abstract findPlaylistById(playlistId: string): Promise<Playlist | null>;
  abstract deletePlaylist(playlistId: string): Promise<void>;
}
