import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from 'src/spotify/domain/ports/repositories/user-repository.port';
import { SpotifyUserClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-user-client.port';

export interface UpdateUserProfileFromSpotifyCommand {
  accessToken: string;
}

@Injectable()
export class SyncSpotifyAccountUsecase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly spotifyUserClient: SpotifyUserClientPort,
  ) {}

  async execute(command: UpdateUserProfileFromSpotifyCommand): Promise<User> {
    const { accessToken } = command;

    const profile = await this.spotifyUserClient.getUserProfile(accessToken);

    const updatedUser: User = User.fromSpotifyUserProfile(profile);
    const user = await this.userRepository.saveOrUpdate(updatedUser);

    return user;
  }
}
