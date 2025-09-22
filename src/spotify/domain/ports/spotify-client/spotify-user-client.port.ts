import { SpotifyUserProfileDto } from 'src/spotify/application/dto/spotify-user-profile.dto';

export abstract class SpotifyUserClientPort {
  abstract getUserProfile(accessToken: string): Promise<SpotifyUserProfileDto>;
}
