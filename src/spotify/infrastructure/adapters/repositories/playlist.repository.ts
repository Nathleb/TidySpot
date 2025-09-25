import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';

@Injectable()
export class PlaylistRepository
  extends PlaylistRepositoryPort
  implements OnModuleInit
{
  private playlists: Playlist[] = [];
  private readonly filePath = join(process.cwd(), 'data', 'playlists.json');

  async onModuleInit() {
    await this.loadPlaylists();
  }

  private async loadPlaylists(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });

      const data = await fs.readFile(this.filePath, 'utf8');
      this.playlists = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty object
        this.playlists = [];
        await this.persistPlaylists();
      } else {
        throw error;
      }
    }
  }

  private async persistPlaylists(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.playlists, null, 2));
  }

  async save(playlist: Playlist): Promise<Playlist> {
    const index = this.playlists.findIndex((p) => p.id === playlist.id);

    if (index !== -1) {
      this.playlists[index] = playlist;
    } else {
      this.playlists.push(playlist);
    }

    await this.persistPlaylists();
    return playlist;
  }
  async saveMany(playlists: Playlist[]): Promise<Playlist[]> {
    const playlistMap = new Map(this.playlists.map((p) => [p.id, p]));

    for (const playlist of playlists) {
      playlistMap.set(playlist.id, playlist);
    }

    this.playlists = Array.from(playlistMap.values());

    await this.persistPlaylists();
    return playlists;
  }
  findAllByOwnerId(ownerId: string): Promise<Playlist[]> {
    const userPlaylists = this.playlists.filter((p) => p.ownerId === ownerId);
    return Promise.resolve(userPlaylists);
  }
  findById(playlistId: string): Promise<Playlist | null> {
    const playlist = this.playlists.find((p) => p.id === playlistId);
    return Promise.resolve(playlist || null);
  }
  deleteById(playlistId: string): Promise<void> {
    const initialLength = this.playlists.length;
    this.playlists = this.playlists.filter((p) => p.id !== playlistId);
    if (this.playlists.length === initialLength) {
      throw new Error(`Playlist with ID ${playlistId} not found.`);
    }
    return this.persistPlaylists();
  }
}
