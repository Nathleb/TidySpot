import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';

interface UserPlaylistsData {
  [userId: string]: Playlist[];
}

@Injectable()
export class PlaylistRepository
  extends PlaylistRepositoryPort
  implements OnModuleInit
{
  private userPlaylists: UserPlaylistsData = {};
  private readonly filePath = join(process.cwd(), 'data', 'playlists.json');

  async onModuleInit() {
    await this.loadPlaylists();
  }

  private async loadPlaylists(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });

      const data = await fs.readFile(this.filePath, 'utf8');
      this.userPlaylists = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty object
        this.userPlaylists = {};
        await this.persistPlaylists();
      } else {
        throw error;
      }
    }
  }

  private async persistPlaylists(): Promise<void> {
    await fs.writeFile(
      this.filePath,
      JSON.stringify(this.userPlaylists, null, 2),
    );
  }

  async saveUserPlaylists(
    userId: string,
    playlists: Playlist[],
  ): Promise<void> {
    this.userPlaylists[userId] = playlists;
    await this.persistPlaylists();
  }

  async findUserPlaylists(userId: string): Promise<Playlist[]> {
    return Promise.resolve(this.userPlaylists[userId] || []);
  }

  async findPlaylistById(playlistId: string): Promise<Playlist | null> {
    // Search through all users' playlists to find the playlist by ID
    for (const playlists of Object.values(this.userPlaylists)) {
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) {
        return Promise.resolve(playlist);
      }
    }
    return Promise.resolve(null);
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    let found = false;
    for (const userId in this.userPlaylists) {
      const playlists = this.userPlaylists[userId];
      const index = playlists.findIndex((p) => p.id === playlistId);
      if (index !== -1) {
        playlists.splice(index, 1);
        found = true;
        break;
      }
    }
    if (found) {
      await this.persistPlaylists();
    }
  }
}
