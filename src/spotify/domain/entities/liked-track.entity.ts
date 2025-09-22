import { SpotifyLikedTrackDto } from 'src/spotify/application/dto/spotify-liked-track.dto';
import { Track } from './track.entity';

export class LikedTrack {
  constructor(
    public readonly trackId: string,
    public readonly userId: string,
    public readonly track: Track,
    public readonly likedAt: Date,
  ) {}

  static fromSpotifyLikedTrack(
    savedTrack: SpotifyLikedTrackDto,
    userId: string,
  ): LikedTrack {
    return new LikedTrack(
      savedTrack.track.id,
      userId,
      Track.fromSpotifyTrack(savedTrack.track),
      new Date(savedTrack.added_at),
    );
  }
}
