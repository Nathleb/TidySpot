import { LikedTrack } from '../../entities/liked-track.entity';

export abstract class LikedTrackRepositoryPort {
  abstract saveUserLikedSongs(
    userId: string,
    tracks: LikedTrack[],
  ): Promise<void>;
  abstract findUserLikedSongs(userId: string): Promise<LikedTrack[]>;
}
