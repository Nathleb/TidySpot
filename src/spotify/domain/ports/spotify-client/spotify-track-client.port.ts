import { Track } from '../../entities/track.entity';

export abstract class SpotifyTrackClientPort {
  abstract getLikedTracks(
    accessToken: string,
    limit?: number,
    offset?: number,
  ): Promise<Track[]>;
  abstract addTracksToPlaylist(
    accessToken: string,
    playlistId: string,
    trackIds: string[],
  ): Promise<void>;
}
