import { LikedTrack } from '../../entities/liked-track.entity';

export abstract class LikedTrackRepositoryPort {
  abstract saveUserLikedSongs(
    userId: string,
    tracks: LikedTrack[],
  ): Promise<void>;
  abstract findUserLikedSongs(userId: string): Promise<LikedTrack[]>;
  abstract findUserLikedSongsNotInTrackIds(
    userId: string,
    excludeTrackIds: string[],
    offset: number,
    limit: number,
  ): Promise<{ tracks: LikedTrack[]; totalCount: number }>;
  abstract deleteLikedSong(userId: string, trackId: string): Promise<void>;
}
