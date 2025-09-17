import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SpotifyAuthSessionRepositoryPort } from '../../domain/ports/spotify-auth-session-repository.port';

@Injectable()
export class SpotifyAuthGuard implements CanActivate {
  constructor(
    private readonly sessionRepository: SpotifyAuthSessionRepositoryPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const spotifyId = request.session.spotifyId;

    if (!spotifyId) {
      throw new UnauthorizedException('No session found');
    }

    const session = await this.sessionRepository.findBySpotifyId(spotifyId);
    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    request.spotifySession = session;
    return true;
  }
}
