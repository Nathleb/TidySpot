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

  async getAuthUrl(): Promise<string> {
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
    window.localStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state: this.generateState(),
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    });

    return `${accountbaseUri}/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<User> {
    if (state == null) {
      throw new UnauthorizedException('State mismatch');
    }
    try {
      const tokens = await this.spotifyClient.exchangeCodeForTokens(code);
      const profile = await this.spotifyClient.getUserProfile(
        tokens.accessToken,
      );

      let user: User;
      const existingUser = await this.userRepository.findBySpotifyId(
        profile.id,
      );
      if (existingUser) {
        user = await this.userRepository.update(
          new User(
            profile.id,
            profile.displayName,
            profile.email,
            profile.images?.[0]?.url,
          ),
        );
      } else {
        user = await this.userRepository.save(
          new User(
            profile.id,
            profile.displayName,
            profile.email,
            profile.images?.[0]?.url,
          ),
        );
      }

      const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      const session = new SpotifyAuthSession(
        profile.id,
        tokens.accessToken,
        tokens.refreshToken,
        tokenExpiresAt,
      );

      const existingSession =
        await this.spotifyAuthSessionRepository.findBySpotifyId(profile.id);
      if (existingSession) {
        await this.spotifyAuthSessionRepository.update(session);
      } else {
        await this.spotifyAuthSessionRepository.save(session);
      }

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
    return window.crypto.subtle.digest('SHA-256', data);
  };

  private base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };
}
