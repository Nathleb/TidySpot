import { SpotifyAuthSession } from '../entities/spotifyAuthSession';

export abstract class SpotifyAuthSessionRepositoryPort {
  abstract findBySpotifyId(
    spotifyId: string,
  ): Promise<SpotifyAuthSession | null>;
  abstract save(session: SpotifyAuthSession): Promise<SpotifyAuthSession>;
  abstract update(session: SpotifyAuthSession): Promise<SpotifyAuthSession>;
  abstract delete(spotifyId: string): Promise<void>;
  abstract saveOrUpdate(
    session: SpotifyAuthSession,
  ): Promise<SpotifyAuthSession>;
}
