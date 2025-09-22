import { SpotifyLikedTrackDto } from 'src/spotify/application/dto/spotify-liked-track.dto';
import { SpotifyPlaylistTrackDto } from 'src/spotify/application/dto/spotify-playlist-track.dto';

export abstract class SpotifyTrackClientPort {
  abstract getUserLikedTracks(
    accessToken: string,
    limit?: number,
    offset?: number,
  ): Promise<SpotifyLikedTrackDto[]>;
  abstract getPlaylistTracks(
    accessToken: string,
    playlistId: string,
    limit?: number,
    offset?: number,
  ): Promise<SpotifyPlaylistTrackDto[]>;
  abstract addTracksToPlaylist(
    accessToken: string,
    playlistId: string,
    trackIds: string[],
  ): Promise<void>;
  abstract getAllUserLikedTracks(
    accessToken: string,
  ): Promise<SpotifyLikedTrackDto[]>;
  abstract getAllPlaylistTracks(
    accessToken: string,
    playlistId: string,
  ): Promise<SpotifyPlaylistTrackDto[]>;
}
