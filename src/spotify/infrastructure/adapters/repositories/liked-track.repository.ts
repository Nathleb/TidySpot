import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { LikedTrack } from 'src/spotify/domain/entities/liked-track.entity';
import { LikedTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/liked-track-repository.port';

interface UserLikedTracksData {
  [userId: string]: LikedTrack[];
}

@Injectable()
export class LikedTrackRepository
  extends LikedTrackRepositoryPort
  implements OnModuleInit
{
  private userLikedTracks: UserLikedTracksData = {};
  private readonly filePath = join(process.cwd(), 'data', 'liked-tracks.json');

  async onModuleInit() {
    await this.loadLikedTracks();
  }

  private async loadLikedTracks(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });

      const data = await fs.readFile(this.filePath, 'utf8');
      this.userLikedTracks = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty object
        this.userLikedTracks = {};
        await this.persistLikedTracks();
      } else {
        throw error;
      }
    }
  }

  private async persistLikedTracks(): Promise<void> {
    await fs.writeFile(
      this.filePath,
      JSON.stringify(this.userLikedTracks, null, 2),
    );
  }

  async saveUserLikedSongs(
    userId: string,
    tracks: LikedTrack[],
  ): Promise<void> {
    this.userLikedTracks[userId] = tracks;
    await this.persistLikedTracks();
  }

  async findUserLikedSongs(userId: string): Promise<LikedTrack[]> {
    return Promise.resolve(this.userLikedTracks[userId] || []);
  }
}
