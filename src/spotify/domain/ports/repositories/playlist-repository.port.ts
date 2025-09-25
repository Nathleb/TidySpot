import { Playlist } from '../../entities/playlist.entity';

export abstract class PlaylistRepositoryPort {
  abstract save(playlist: Playlist): Promise<Playlist>;
  abstract saveMany(playlists: Playlist[]): Promise<Playlist[]>;
  abstract findAllByOwnerId(ownerId: string): Promise<Playlist[]>;
  abstract findById(playlistId: string): Promise<Playlist | null>;
  abstract deleteById(playlistId: string): Promise<void>;
}
