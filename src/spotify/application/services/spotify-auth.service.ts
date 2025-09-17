import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpotifyClientPort } from '../../domain/ports/spotify-client.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/entities/user.entity';
import * as crypto from 'crypto';
import { SpotifyAuthSession } from 'src/spotify/domain/entities/spotifyAuthSession';
import { SpotifyAuthSessionRepositoryPort } from 'src/spotify/domain/ports/spotify-auth-session-repository.port';

@Injectable()
export class SpotifyAuthService {
  constructor(
    private readonly spotifyClient: SpotifyClientPort,
    private readonly spotifyAuthSessionRepository: SpotifyAuthSessionRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  async getAuthUrl(): Promise<{
    url: string;
    codeVerifier: string;
    state: string;
  }> {
    const clientId = this.configService.getOrThrow<string>('spotify.clientId');
    const redirectUri = this.configService.getOrThrow<string>(
      'spotify.redirectUri',
    );
    const scopes = this.configService.getOrThrow<string>('spotify.scopes');
    const accountbaseUri =
      this.configService.getOrThrow<string>('spotify.accountUrl');

    const codeVerifier = this.generateRandomString(64);
    const hashed = await this.sha256(codeVerifier);
    const codeChallenge = this.base64encode(hashed);
    const state = this.generateState();

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    return {
      url: `${this.configService.get('spotify.accountUrl')}/authorize?${params.toString()}`,
      codeVerifier,
      state,
    };
  }

  async handleCallback(code: string, codeVerifier: string): Promise<User> {
    if (!codeVerifier) {
      throw new UnauthorizedException('Missing code verifier');
    }

    try {
      const tokens = await this.spotifyClient.exchangeCodeForTokens(
        code,
        codeVerifier,
      );
      const profile = await this.spotifyClient.getUserProfile(
        tokens.accessToken,
      );

      const user: User = User.fromSpotifyUserProfile(profile);

      this.userRepository.saveOrUpdate(user);

      const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      const session = new SpotifyAuthSession(
        profile.id,
        tokens.accessToken,
        tokens.refreshToken,
        tokenExpiresAt,
      );

      this.spotifyAuthSessionRepository.saveOrUpdate(session);
      return user;
    } catch (error) {
      console.error('Failed to authenticate with Spotify', error);
      throw new UnauthorizedException('Failed to authenticate with Spotify');
    }
  }

  async refreshUserTokens(
    session: SpotifyAuthSession,
  ): Promise<SpotifyAuthSession> {
    if (!session.isTokenExpired()) {
      return session;
    }

    try {
      const tokens = await this.spotifyClient.refreshTokens(
        session.refreshToken,
      );

      const updatedSession = session.refresh(
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresIn,
      );

      return await this.spotifyAuthSessionRepository.update(updatedSession);
    } catch (error) {
      console.error('Failed to refresh Spotify tokens', error);
      throw new UnauthorizedException('Failed to refresh Spotify tokens');
    }
  }

  private generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  //***** Spotify documentation for code challenge *****/
  private generateRandomString = (length: number) => {
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  };

  private sha256 = async (plain: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
  };

  private base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };
}
