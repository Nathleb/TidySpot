import { Injectable } from '@nestjs/common';
import { Playlist } from 'src/spotify/domain/entities/playlist.entity';
import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';

export interface ToggleForSortingPlaylistCommand {
  playlistId: string;
}

@Injectable()
export class ToggleForSortingPlaylistUseCase {
  constructor(private readonly playlistRepository: PlaylistRepositoryPort) {}

  async execute(command: ToggleForSortingPlaylistCommand): Promise<Playlist> {
    const { playlistId } = command;

    try {
      const playlist = await this.playlistRepository.findById(playlistId);

      if (!playlist) {
        throw new Error('Playlist not found');
      }

      const updatedPlaylist = playlist.toggleUsedForSorting();
      await this.playlistRepository.save(updatedPlaylist);
      return updatedPlaylist;
    } catch (error) {
      //todo differencier error de repo et de spotify
      throw error;
    }
  }
}
