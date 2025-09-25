import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PlaylistTrack } from 'src/spotify/domain/entities/playlist-track.entity';
import { PlaylistTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-track-repository.port';

interface PlaylistTracksData {
  [playlistId: string]: PlaylistTrack[];
}

@Injectable()
export class PlaylistTrackRepository
  implements PlaylistTrackRepositoryPort, OnModuleInit
{
  private playlistTracks: PlaylistTracksData = {};
  private readonly filePath = join(
    process.cwd(),
    'data',
    'playlist-tracks.json',
  );

  async onModuleInit() {
    await this.loadPlaylistTracks();
  }

  private async loadPlaylistTracks(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });

      const data = await fs.readFile(this.filePath, 'utf8');
      this.playlistTracks = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty object
        this.playlistTracks = {};
        await this.persistPlaylistTracks();
      } else {
        throw error;
      }
    }
  }

  private async persistPlaylistTracks(): Promise<void> {
    await fs.writeFile(
      this.filePath,
      JSON.stringify(this.playlistTracks, null, 2),
    );
  }

  replaceAllPlaylistTracks(
    playlistId: string,
    tracks: PlaylistTrack[],
  ): Promise<void> {
    this.playlistTracks[playlistId] = tracks;
    return this.persistPlaylistTracks();
  }

  addTrackToPlaylist(
    playlistId: string,
    playlistTrack: PlaylistTrack,
  ): Promise<void> {
    if (!this.playlistTracks[playlistId]) {
      this.playlistTracks[playlistId] = [];
    }
    this.playlistTracks[playlistId].push(playlistTrack);
    return this.persistPlaylistTracks();
  }

  getTracksByPlaylistId(playlistId: string): Promise<PlaylistTrack[]> {
    return Promise.resolve(this.playlistTracks[playlistId] || []);
  }

  findByPlaylistIdAndTrackId(
    playlistId: string,
    trackId: string,
  ): Promise<PlaylistTrack | null> {
    const tracks = this.playlistTracks[playlistId] || [];
    const track = tracks.find((t) => t.trackId === trackId);
    return Promise.resolve(track || null);
  }

  getTracksFromSortingPlaylistsByUserId(
    userId: string,
  ): Promise<PlaylistTrack[]> {
    //genre un join sur l'id etc
    const tracks: PlaylistTrack[] = [];

    return Promise.resolve(tracks);
  }
}
