export interface SpotifyUserProfileDto {
  id: string;
  display_name: string;
  email?: string;
  images?: Array<{ url: string; width: number; height: number }>;
  external_urls?: { spotify: string };
  country?: string;
  followers?: { total: number };
}
