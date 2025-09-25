import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SpotifyPlaylistClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-playlist-client.port';
import {
  SpotifyPlaylistDto,
  mapToSpotifyPlaylistDto,
} from 'src/spotify/application/dto/spotify-playlist.dto';

@Injectable()
export class SpotifyPlaylistApiAdapter extends SpotifyPlaylistClientPort {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();

    this.apiUrl = this.configService.getOrThrow<string>('spotify.apiUrl');
  }

  async getUserPlaylists(
    accessToken: string,
    userId: string,
  ): Promise<SpotifyPlaylistDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SpotifyApi.ListOfCurrentUsersPlaylistsResponse>(
          `${this.apiUrl}/v1/users/${userId}/playlists`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );

      return response.data.items.map(mapToSpotifyPlaylistDto);
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
  ): Promise<SpotifyPlaylistDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<SpotifyApi.CreatePlaylistResponse>(
          `${this.apiUrl}/v1/users/${userId}/playlists`,
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
      return mapToSpotifyPlaylistDto(playlist);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to create playlist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deletePlaylist(accessToken: string, playlistId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.apiUrl}/v1/playlists/${playlistId}/followers`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
      );
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to delete playlist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
