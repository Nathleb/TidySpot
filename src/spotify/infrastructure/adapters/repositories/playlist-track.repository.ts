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

  async savePlaylistTracks(
    playlistId: string,
    tracks: PlaylistTrack[],
  ): Promise<void> {
    this.playlistTracks[playlistId] = tracks;
    await this.persistPlaylistTracks();
  }

  async findPlaylistTracks(playlistId: string): Promise<PlaylistTrack[]> {
    return Promise.resolve(this.playlistTracks[playlistId] || []);
  }
}
