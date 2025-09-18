import { SpotifyTokens } from './interfaces/SpotifyTokens';

export abstract class SpotifyAuthClientPort {
  abstract exchangeCodeForTokens(
    code: string,
    codeVerifier: string,
  ): Promise<SpotifyTokens>;
  abstract refreshTokens(refreshToken: string): Promise<SpotifyTokens>;
}
