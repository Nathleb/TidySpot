export interface SpotifyUserProfile {
  id: string;
  displayName: string;
  email: string;
  images?: Array<{ url: string }>;
}
