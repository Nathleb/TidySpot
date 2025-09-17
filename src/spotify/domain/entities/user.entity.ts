import { SpotifyUserProfile } from '../ports/spotify-client.port';

export class User {
  constructor(
    public readonly spotifyId: string,
    public readonly displayName: string,
    public readonly email: string,
    public readonly profileImage?: string,
  ) {}

  static fromSpotifyUserProfile(profile: SpotifyUserProfile) {
    return new User(
      profile.id,
      profile.displayName,
      profile.email,
      profile.images && profile.images.length > 0 ? profile.images[0].url : '',
    );
  }
}
