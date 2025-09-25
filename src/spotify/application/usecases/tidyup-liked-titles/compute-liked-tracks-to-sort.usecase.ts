import { Injectable } from '@nestjs/common';
import { LikedTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/liked-track-repository.port';
import { PlaylistTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-track-repository.port';
import { LikedTrack } from 'src/spotify/domain/entities/liked-track.entity';

export interface ComputeLikedTracksToSortCommand {
  userId: string;
  page?: number;
  limit?: number;
}

export interface PaginatedLikedTracks {
  tracks: LikedTrack[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

//CQRS ?? et cACHE surtout
@Injectable()
export class ComputeLikedTracksToSortUseCase {
  constructor(
    private readonly likedTrackRepository: LikedTrackRepositoryPort,
    private readonly playlistTrackRepository: PlaylistTrackRepositoryPort,
  ) {}

  async execute(
    command: ComputeLikedTracksToSortCommand,
  ): Promise<PaginatedLikedTracks> {
    const { userId, page = 1, limit = 50 } = command;
    const offset = (page - 1) * limit;

    try {
      const sortingTrackIds = await this.getSortingTrackIds(userId);

      const { tracks, totalCount } =
        await this.likedTrackRepository.findUserLikedSongsNotInTrackIds(
          userId,
          sortingTrackIds,
          offset,
          limit,
        );

      return {
        tracks,
        totalCount,
        page,
        limit,
        hasMore: offset + tracks.length < totalCount,
      };
    } catch (error) {
      throw error;
    }
  }

  private async getSortingTrackIds(userId: string): Promise<string[]> {
    const playlistTracks =
      await this.playlistTrackRepository.getTracksFromSortingPlaylistsByUserId(
        userId,
      );

    return playlistTracks.map((pt) => pt.trackId);
  }
}
