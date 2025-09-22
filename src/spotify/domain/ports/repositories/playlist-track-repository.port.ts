import { PlaylistTrack } from '../../entities/playlist-track.entity';

export abstract class PlaylistTrackRepositoryPort {
  abstract savePlaylistTracks(
    playlistId: string,
    tracks: PlaylistTrack[],
  ): Promise<void>;
  abstract findPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]>;
}
