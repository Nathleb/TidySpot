import { SpotifyTrackDto } from 'src/spotify/application/dto/spotify-track.dto';

export class Track {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly artists: string[],
    public readonly albumName: string,
    public readonly albumImageUrl?: string,
    public readonly previewUrl?: string,
    public readonly spotifyUrl?: string,
    public readonly durationMs: number = 0,
    public readonly popularity: number = 0,
  ) {}

  static fromSpotifyTrack(track: SpotifyTrackDto): Track {
    return new Track(
      track.id,
      track.name,
      track.artists.map((artist) => artist.name),
      track.album.name,
      track.album.images?.[0]?.url,
      track.preview_url,
      track.external_urls?.spotify,
      track.duration_ms,
      track.popularity,
    );
  }
}
