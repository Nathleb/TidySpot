import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SpotifyAuthClientPort } from '../../../domain/ports/spotify-client/spotify-auth-client.port';
import { AxiosResponse } from 'axios';
import { SpotifyResponseToken } from './interfaces/SpotifyResponseToken';
import { SpotifyTokens } from 'src/spotify/domain/ports/spotify-client/interfaces/SpotifyTokens';

@Injectable()
export class SpotifyAuthApiAdapter extends SpotifyAuthClientPort {
  private readonly accountUrl: string;
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
    this.clientId = this.configService.getOrThrow<string>('spotify.clientId');
    this.clientSecret = this.configService.getOrThrow<string>(
      'spotify.clientSecret',
    );
    this.redirectUri = this.configService.getOrThrow<string>(
      'spotify.redirectUri',
    );
  }

  async exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<SpotifyTokens> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: codeVerifier,
    });

    const authHeader = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    try {
      const response: AxiosResponse<SpotifyResponseToken> =
        await firstValueFrom(
          this.httpService.post(
            `${this.accountUrl}/api/token`,
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
      client_id: this.clientId,
    });

    const authHeader = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    try {
      const response = await firstValueFrom(
        this.httpService.post<SpotifyResponseToken>(
          `${this.accountUrl}/api/token`,
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
}
