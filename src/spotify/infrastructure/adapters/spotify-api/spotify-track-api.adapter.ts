import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Track } from 'src/spotify/domain/entities/track.entity';
import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';

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
        // track.is_local
        // track.uri
        // track.href
        // track.external_urls
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

  async getTracksByPlaylistId(
    accessToken: string,
    playlistId: string,
    limit = 50,
    offset = 0,
  ): Promise<Track[]> {
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

      return response.data.items.map((item) => {
        const track = item.track as SpotifyApi.TrackObjectFull;
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
        'Failed to get tracks by playlist ID',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
