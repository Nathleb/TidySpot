import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';
import { SpotifyUserClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-user-client.port';

@Injectable()
export class SpotifyUserService {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly spotifyUserClient: SpotifyUserClientPort,
  ) {}

  async updateUserProfileFromSpotify(accessToken: string): Promise<User> {
    const profile = await this.spotifyUserClient.getUserProfile(accessToken);

    const updatedUser: User = User.fromSpotifyUserProfile(profile);
    const user = await this.userRepository.saveOrUpdate(updatedUser);

    return user;
  }
}
