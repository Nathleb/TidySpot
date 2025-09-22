import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';
import {
  mapToSpotifyLikedTrackDto,
  SpotifyLikedTrackDto,
} from 'src/spotify/application/dto/spotify-liked-track.dto';
import { SpotifyPlaylistTrackDto } from 'src/spotify/application/dto/spotify-playlist-track.dto';

@Injectable()
export class SpotifyTrackApiAdapter extends SpotifyTrackClientPort {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.apiUrl = this.configService.getOrThrow<string>('spotify.apiUrl');
  }

  async getUserLikedTracks(
    accessToken: string,
    limit = 50,
    offset = 0,
  ): Promise<SpotifyLikedTrackDto[]> {
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

      return response.data.items.map(mapToSpotifyLikedTrackDto);
    } catch (error) {
      console.error('Failed to get liked tracks:', error);
      throw new HttpException(
        'Failed to get liked tracks',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPlaylistTracks(
    accessToken: string,
    playlistId: string,
    limit = 50,
    offset = 0,
  ): Promise<SpotifyPlaylistTrackDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<SpotifyApi.PlaylistTrackResponse>(
          `${this.apiUrl}/playlists/${playlistId}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: { limit, offset },
          },
        ),
      );

      return response.data.items
        .filter(
          (item): item is SpotifyApi.PlaylistTrackObject => item.track !== null,
        )
        .map(mapToSpotifyLikedTrackDto);
    } catch (error) {
      console.error('Failed to get playlist tracks:', error);
      throw new HttpException(
        'Failed to get tracks by playlist ID',
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
          { uris },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error) {
      console.error('Failed to add tracks to playlist:', error);
      throw new HttpException(
        'Failed to add tracks to playlist',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllUserLikedTracks(
    accessToken: string,
  ): Promise<SpotifyLikedTrackDto[]> {
    const allTracks: SpotifyLikedTrackDto[] = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const tracks = await this.getUserLikedTracks(accessToken, limit, offset);
      allTracks.push(...tracks);

      hasMore = tracks.length === limit;
      offset += limit;
    }

    return allTracks;
  }

  async getAllPlaylistTracks(
    accessToken: string,
    playlistId: string,
  ): Promise<SpotifyPlaylistTrackDto[]> {
    const allTracks: SpotifyPlaylistTrackDto[] = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const tracks = await this.getPlaylistTracks(
        accessToken,
        playlistId,
        limit,
        offset,
      );
      allTracks.push(...tracks);

      hasMore = tracks.length === limit;
      offset += limit;
    }

    return allTracks;
  }
}
