import { SpotifyUserProfile } from './interfaces/SpotifyUserProfile';

export abstract class SpotifyUserClientPort {
  abstract getUserProfile(accessToken: string): Promise<SpotifyUserProfile>;
}
