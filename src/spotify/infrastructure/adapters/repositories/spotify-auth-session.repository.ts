import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { SpotifyAuthSession } from 'src/spotify/domain/entities/spotify-auth-session.entity';
import { SpotifyAuthSessionRepositoryPort } from 'src/spotify/domain/ports/repositories/spotify-auth-session-repository.port';

@Injectable()
export class SpotifyAuthSessionRepository
  extends SpotifyAuthSessionRepositoryPort
  implements OnModuleInit
{
  private sessions: SpotifyAuthSession[] = [];
  private readonly filePath = join(
    process.cwd(),
    'data',
    'spotify-auth-sessions.json',
  );

  async onModuleInit() {
    await this.loadSessions();
  }

  private async loadSessions(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(join(process.cwd(), 'data'), { recursive: true });

      const data = await fs.readFile(this.filePath, 'utf8');
      this.sessions = JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, start with empty array
        this.sessions = [];
        await this.persistSessions();
      } else {
        throw error;
      }
    }
  }

  private async persistSessions(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.sessions, null, 2));
  }

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
    await this.persistSessions();
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
    await this.persistSessions();
    return Promise.resolve(session);
  }

  async delete(spotifyId: string): Promise<void> {
    const initialLength = this.sessions.length;
    this.sessions = this.sessions.filter((s) => s.spotifyId !== spotifyId);
    if (this.sessions.length === initialLength) {
      throw new NotFoundException('Auth session not found for deletion.');
    }
    await this.persistSessions();
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
