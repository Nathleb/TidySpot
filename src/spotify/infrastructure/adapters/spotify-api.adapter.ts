// src/spotify/infrastructure/adapters/spotify-api.adapter.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  SpotifyClientPort,
  SpotifyTokens,
  SpotifyUserProfile,
} from '../../domain/ports/spotify-client.port';
import { AxiosResponse } from 'axios';
import { Track } from 'src/spotify/domain/entities/track.entity';

interface SpotifyResponseToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

@Injectable()
export class SpotifyApiAdapter extends SpotifyClientPort {
  private readonly accountUrl: string;
  private readonly apiUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.accountUrl =
      this.configService.getOrThrow<string>('spotify.accountUrl');
    this.apiUrl = this.configService.getOrThrow<string>('spotify.apiUrl');
    this.clientId = this.configService.getOrThrow<string>('spotify.clientId');
    this.clientSecret = this.configService.getOrThrow<string>(
      'spotify.clientSecret',
    );
    this.redirectUri = this.configService.getOrThrow<string>(
      'spotify.redirectUri',
    );
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
    });

    const authHeader = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');
    try {
      const response: AxiosResponse<SpotifyResponseToken> =
        await firstValueFrom(
          this.httpService.post(`${this.accountUrl}/token`, params.toString(), {
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }),
        );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to exchange code for tokens',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refreshTokens(refreshToken: string): Promise<SpotifyTokens> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const authHeader = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    try {
      const response = await firstValueFrom(
        this.httpService.post<SpotifyResponseToken>(
          `${this.accountUrl}/token`,
          params.toString(),
          {
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to refresh tokens',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SpotifyApi.CurrentUsersProfileResponse>(
          `${this.apiUrl}/me`,
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

  async getLikedTracks(
    accessToken: string,
    limit = 50,
    offset = 0,
  ): Promise<Track[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SpotifyApi.UsersSavedTracksResponse>(
          `${this.apiUrl}/me/tracks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: { limit, offset },
          },
        ),
      );

      return response.data.items.map((item: SpotifyApi.SavedTrackObject) => {
        const { track } = item;

        return new Track(
          track.id,
          track.name,
          track.artists.map((artist) => artist.name),
          track.album.name,
          track.album.images[0]?.url || '',
          track.preview_url,
          track.duration_ms,
          track.external_urls.spotify,
        );
      });
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to get liked tracks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
