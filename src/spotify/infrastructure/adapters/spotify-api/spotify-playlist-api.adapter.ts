import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';
import { SpotifyPlaylistClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-playlist-client.port';

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
}
