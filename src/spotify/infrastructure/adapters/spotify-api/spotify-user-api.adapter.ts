import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SpotifyUserClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-user-client.port';
import {
  mapToSpotifyUserProfileDto,
  SpotifyUserProfileDto,
} from 'src/spotify/application/dto/spotify-user-profile.dto';

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

  async getUserProfile(accessToken: string): Promise<SpotifyUserProfileDto> {
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

      return mapToSpotifyUserProfileDto(response.data);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to get user profile',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
