import { SpotifyUserProfileDto } from 'src/spotify/application/dto/spotify-user-profile.dto';

export class User {
  constructor(
    public readonly id: string,
    public readonly displayName: string,
    public readonly email?: string,
    public readonly profileImageUrl?: string,
    public readonly spotifyUrl?: string,
    public readonly country?: string,
    public readonly updatedAt: Date = new Date(),
  ) {}

  static fromSpotifyUserProfile(profile: SpotifyUserProfileDto): User {
    return new User(
      profile.id,
      profile.display_name,
      profile.email,
      profile.images?.[0]?.url,
      profile.external_urls?.spotify,
      profile.country,
    );
  }
}
