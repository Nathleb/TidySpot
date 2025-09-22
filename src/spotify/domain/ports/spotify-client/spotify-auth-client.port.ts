import { SpotifyAuthDto } from 'src/spotify/application/dto/spotify-auth.dto';

export abstract class SpotifyAuthClientPort {
  abstract exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<SpotifyAuthDto>;
  abstract refreshTokens(refreshToken: string): Promise<SpotifyAuthDto>;
}
