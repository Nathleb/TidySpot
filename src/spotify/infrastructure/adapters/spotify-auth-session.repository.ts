import { Injectable, NotFoundException } from '@nestjs/common';
import { SpotifyAuthSession } from 'src/spotify/domain/entities/spotifyAuthSession';
import { SpotifyAuthSessionRepositoryPort } from 'src/spotify/domain/ports/spotify-auth-session-repository.port';

@Injectable()
export class SpotifyAuthSessionRepository extends SpotifyAuthSessionRepositoryPort {
  private sessions: SpotifyAuthSession[] = [];

  async findBySpotifyId(spotifyId: string): Promise<SpotifyAuthSession | null> {
    const session = this.sessions.find((s) => s.spotifyId === spotifyId);
    return Promise.resolve(session || null);
  }

  async findBySessionId(sessionId: string): Promise<SpotifyAuthSession | null> {
    const session = this.sessions.find((s) => s.sessionId === sessionId);
    return Promise.resolve(session || null);
  }

  async save(session: SpotifyAuthSession): Promise<SpotifyAuthSession> {
    const existingSession = this.sessions.find(
      (s) => s.spotifyId === session.spotifyId,
    );
    if (existingSession) {
      throw new Error('Auth session already exists for this user.');
    }
    this.sessions.push(session);
    return Promise.resolve(session);
  }

  async update(session: SpotifyAuthSession): Promise<SpotifyAuthSession> {
    const index = this.sessions.findIndex(
      (s) => s.spotifyId === session.spotifyId,
    );
    if (index === -1) {
      throw new NotFoundException('Auth session not found.');
    }
    this.sessions[index] = session;
    return Promise.resolve(session);
  }

  async delete(spotifyId: string): Promise<void> {
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter((s) => s.spotifyId !== spotifyId);
    if (this.sessions.length === initialLength) {
      throw new NotFoundException('Auth session not found for deletion.');
    }
    return Promise.resolve();
  }

  async saveOrUpdate(session: SpotifyAuthSession): Promise<SpotifyAuthSession> {
    const existingSession = await this.findBySpotifyId(session.spotifyId);
    if (existingSession) {
      return this.update(session);
    } else {
      return this.save(session);
    }
  }
}
