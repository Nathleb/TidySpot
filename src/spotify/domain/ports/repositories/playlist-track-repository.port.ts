import { PlaylistTrack } from '../../entities/playlist-track.entity';

export abstract class PlaylistTrackRepositoryPort {
  abstract replaceAllPlaylistTracks(
    playlistId: string,
    tracks: PlaylistTrack[],
  ): Promise<void>;

  abstract addTrackToPlaylist(
    playlistId: string,
    playlistTrack: PlaylistTrack,
  ): Promise<void>;
  abstract getTracksByPlaylistId(playlistId: string): Promise<PlaylistTrack[]>;

  abstract findByPlaylistIdAndTrackId(
    playlistId: string,
    trackId: string, // Assuming trackId is a string
  ): Promise<PlaylistTrack | null>;

  abstract getTracksFromSortingPlaylistsByUserId(
    userId: string,
  ): Promise<PlaylistTrack[]>;
}
