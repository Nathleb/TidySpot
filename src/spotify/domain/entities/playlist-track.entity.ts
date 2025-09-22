import { SpotifyPlaylistTrackDto } from 'src/spotify/application/dto/spotify-playlist-track.dto';

export class PlaylistTrack {
  constructor(
    public readonly playlistId: string,
    public readonly trackId: string,
    public readonly addedAt: Date,
    public readonly addedBy?: string,
  ) {}

  static fromSpotifyPlaylistTrack(
    playlistTrack: SpotifyPlaylistTrackDto,
    playlistId: string,
  ): PlaylistTrack {
    return new PlaylistTrack(
      playlistId,
      playlistTrack.track.id,
      new Date(playlistTrack.added_at),
      playlistTrack.added_by?.id,
    );
  }
}
