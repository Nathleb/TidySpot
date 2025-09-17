import { Injectable } from '@nestjs/common';
import { SpotifyClientPort } from '../../domain/ports/spotify-client.port';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from 'src/spotify/domain/ports/user-repository.port';

@Injectable()
export class SpotifyUserService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly spotifyClient: SpotifyClientPort,
  ) {}

  async updateUserProfileFromSpotify(accessToken: string): Promise<User> {
    const profile = await this.spotifyClient.getUserProfile(accessToken);

    const updatedUser = new User(
      profile.id,
      profile.displayName,
      profile.email,
      profile.images?.[0]?.url,
    );

    const user = await this.userRepository.saveOrUpdate(updatedUser);

    return user;
  }
}
