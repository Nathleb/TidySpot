import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpotifyClientPort } from '../../domain/ports/spotify-client.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class SpotifyAuthService {
  constructor(
    private readonly spotifyClient: SpotifyClientPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  getAuthUrl(): string {
    const clientId = this.configService.getOrThrow<string>('spotify.clientId');
    const redirectUri = this.configService.getOrThrow<string>(
      'spotify.redirectUri',
    );
    const scopes = this.configService.getOrThrow<string>('spotify.scopes');
    const accountbaseUri =
      this.configService.getOrThrow<string>('spotify.accountUrl');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
      state: this.generateState(),
    });

    return `${accountbaseUri}/authorize?${params.toString()}`;
  }

  async handleCallback(code: string, state: string): Promise<User> {
    // Verify state for CSRF protection
    // In production, you'd want to store and validate the state properly
    if (state == null) {
      throw new Error('state mismatch');
    }
    try {
      const tokens = await this.spotifyClient.exchangeCodeForTokens(code);

      const profile = await this.spotifyClient.getUserProfile(
        tokens.accessToken,
      );

      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      const user = new User(
        profile.id,
        profile.displayName,
        profile.email,
        tokens.accessToken,
        tokens.refreshToken,
        expiresAt,
        profile.images?.[0]?.url,
      );

      const existingUser = await this.userRepository.findBySpotifyId(
        profile.id,
      );

      if (existingUser) {
        return await this.userRepository.update(user);
      } else {
        return await this.userRepository.save(user);
      }
    } catch (error) {
      console.error('Failed to authenticate with Spotify', error);
      throw new UnauthorizedException('Failed to authenticate with Spotify');
    }
  }

  async refreshUserTokens(user: User): Promise<User> {
    if (!user.isTokenExpired()) {
      return user;
    }

    try {
      const tokens = await this.spotifyClient.refreshTokens(user.refreshToken);
      const updatedUser = user.updateTokens(
        tokens.accessToken,
        tokens.refreshToken,
        tokens.expiresIn,
      );

      return await this.userRepository.update(updatedUser);
    } catch (error) {
      console.error('Failed to refresh Spotify tokens', error);
      throw new UnauthorizedException('Failed to refresh Spotify tokens');
    }
  }

  private generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
