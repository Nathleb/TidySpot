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
import { Track } from '../../domain/entities/track.entity';
import { Playlist } from '../../domain/entities/playlist.entity';

@Injectable()
export class SpotifyApiAdapter extends SpotifyClientPort {
  private readonly baseUrl: string;
  private readonly authUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.baseUrl = this.configService.getOrThrow<string>('spotify.apiBaseUrl');
    this.authUrl = this.configService.getOrThrow<string>('spotify.authUrl');
    this.clientId = this.configService.getOrThrow<string>('spotify.clientId');
    this.clientSecret = this.configService.getOrThrow<string>(
      'spotify.clientSecret',
    );
    this.redirectUri = this.configService.getOrThrow<string>(
      'spotify.redirectUri',
    );
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyTokens> {}

  async refreshTokens(refreshToken: string): Promise<SpotifyTokens> {}

  async getUserProfile(accessToken: string): Promise<SpotifyUserProfile> {}

  async getLikedTracks(
    accessToken: string,
    limit = 50,
    offset = 0,
  ): Promise<Track[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/me/tracks`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: { limit, offset },
        }),
      );

      return response.data.items.map(
        (item: any) =>
          new Track(
            item.track.id,
            item.track.name,
            item.track.artists.map((artist: any) => artist.name),
            item.track.album.name,
            item.track.album.images[0]?.url || '',
            item.track.preview_url,
            item.track.duration_ms,
            item.track.external_urls.spotify,
          ),
      );
    } catch (error) {
      throw new HttpException(
        'Failed to get liked tracks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserPlaylists(accessToken: string): Promise<Playlist[]> {}

  async createPlaylist(
    accessToken: string,
    userId: string,
    name: string,
    description = '',
  ): Promise<Playlist> {}

  async addTracksToPlaylist(
    accessToken: string,
    playlistId: string,
    trackIds: string[],
  ): Promise<void> {}
}
