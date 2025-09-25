import { SpotifyPlaylistDto } from 'src/spotify/application/dto/spotify-playlist.dto';

export abstract class SpotifyPlaylistClientPort {
  abstract getUserPlaylists(
    accessToken: string,
    userId: string,
  ): Promise<SpotifyPlaylistDto[]>;
  abstract createPlaylist(
    accessToken: string,
    userId: string,
    name: string,
    description?: string,
  ): Promise<SpotifyPlaylistDto>;
  abstract deletePlaylist(
    accessToken: string,
    playlistId: string,
  ): Promise<void>;
}
