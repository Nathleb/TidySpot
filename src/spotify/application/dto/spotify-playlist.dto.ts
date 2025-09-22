export interface SpotifyPlaylistDto {
  id: string;
  name: string;
  description?: string;
  owner: { id: string; display_name: string };
  public: boolean;
  images?: Array<{ url: string; width: number; height: number }>;
  external_urls?: { spotify: string };
  tracks?: { total: number };
}
