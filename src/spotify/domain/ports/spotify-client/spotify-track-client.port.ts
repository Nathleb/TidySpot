import { SpotifyLikedTrackDto } from 'src/spotify/application/dto/spotify-liked-track.dto';
import { SpotifyPlaylistTrackDto } from 'src/spotify/application/dto/spotify-playlist-track.dto';

export abstract class SpotifyTrackClientPort {
  abstract getLikedTracks(
    accessToken: string,
    limit?: number,
    offset?: number,
  ): Promise<SpotifyLikedTrackDto[]>;
  abstract getTracksByPlaylistId(
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
}
