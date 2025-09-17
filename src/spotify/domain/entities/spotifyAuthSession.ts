export class SpotifyAuthSession {
  constructor(
    public readonly sessionId: string,
    public readonly spotifyId: string,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly tokenExpiresAt: Date,
  ) {}

  isTokenExpired(): boolean {
    return new Date() >= this.tokenExpiresAt;
  }

  refresh(
    newAccessToken: string,
    newRefreshToken: string,
    expiresIn: number,
  ): SpotifyAuthSession {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    return new SpotifyAuthSession(
      this.sessionId,
      this.spotifyId,
      newAccessToken,
      newRefreshToken,
      expiresAt,
    );
  }
}
