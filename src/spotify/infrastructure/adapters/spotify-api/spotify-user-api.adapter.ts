import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SpotifyUserClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-user-client.port';
import { SpotifyUserProfile } from 'src/spotify/domain/ports/spotify-client/interfaces/SpotifyUserProfile';

@Injectable()
export class SpotifyUserApiAdapter extends SpotifyUserClientPort {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.apiUrl = this.configService.getOrThrow<string>('spotify.apiUrl');
  }

  async getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SpotifyApi.CurrentUsersProfileResponse>(
          `${this.apiUrl}/v1/me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      return {
        id: response.data.id,
        displayName: response.data.display_name || 'John Doe',
        email: response.data.email,
        images: response.data.images,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to get user profile',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
