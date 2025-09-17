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
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';

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

  async getUserPlaylists(accessToken: string): Promise<Playlist[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
          `${this.apiUrl}/me/playlists`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      return response.data.items.map(
        (playlist: SpotifyApi.PlaylistObjectSimplified) => {
          return new Playlist(
            playlist.id,
            playlist.name,
            playlist.description || '',
            playlist.tracks.total,
            playlist.owner.display_name || '',
            playlist.external_urls.spotify,
            playlist.images[0]?.url || '',
          );
        },
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to get user playlists',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createPlaylist(
    accessToken: string,
    userId: string,
    name: string,
    description = '',
  ): Promise<Playlist> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<SpotifyApi.CreatePlaylistResponse>(
          `${this.apiUrl}/users/${userId}/playlists`,
          {
            name,
            description,
            public: false,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const playlist = response.data;
      return new Playlist(
        playlist.id,
        playlist.name,
        playlist.description || '',
        playlist.tracks.total,
        playlist.owner.display_name || '',
        playlist.external_urls.spotify,
        playlist.images[0]?.url || '',
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to create playlist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addTracksToPlaylist(
    accessToken: string,
    playlistId: string,
    trackIds: string[],
  ): Promise<void> {
    try {
      const uris = trackIds.map((id) => `spotify:track:${id}`);
      await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/playlists/${playlistId}/tracks`,
          {
            uris,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to add tracks to playlist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
