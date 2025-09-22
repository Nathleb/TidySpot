export interface SpotifyTrackDto {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images?: Array<{ url: string; width: number; height: number }>;
  };
  preview_url?: string;
  external_urls?: { spotify: string };
  duration_ms: number;
  popularity: number;
}
