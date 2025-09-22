import { SpotifyTrackDto } from './spotify-track.dto';

export interface SpotifyPlaylistTrackDto {
  added_at: string;
  added_by?: { id: string };
  track: SpotifyTrackDto;
}
