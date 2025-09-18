import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SpotifyAuthSessionRepositoryPort } from '../../domain/ports/repositories/spotify-auth-session-repository.port';
import { Request } from 'express';
import { SpotifyAuthClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-auth-client.port';

@Injectable()
export class SpotifyAuthGuard implements CanActivate {
  constructor(
    private readonly sessionRepository: SpotifyAuthSessionRepositoryPort,
    private readonly spotifyAuthClient: SpotifyAuthClientPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const sessionId = request.sessionID;
    if (!sessionId) {
      throw new UnauthorizedException('No active session ID found.');
    }

    const session = await this.sessionRepository.findBySessionId(sessionId);

    if (!session) {
      throw new UnauthorizedException('Session expired or not found.');
    }

    const now = new Date();
    if (session.tokenExpiresAt <= now) {
      try {
        const newTokens = await this.spotifyAuthClient.refreshTokens(
          session.refreshToken,
        );

        session.refresh(
          newTokens.accessToken,
          newTokens.refreshToken,
          newTokens.expiresIn,
        );

        await this.sessionRepository.update(session);
      } catch (error) {
        throw new UnauthorizedException(
          'Failed to refresh access token. Please log in again.',
        );
      }
    }

    request.accessToken = session.accessToken;

    return true;
  }
}
