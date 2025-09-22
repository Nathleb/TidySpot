import { SpotifyTrackDto } from './spotify-track.dto';

export interface SpotifyLikedTrackDto {
  added_at: string;
  track: SpotifyTrackDto;
}
