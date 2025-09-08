export class User {
  constructor(
    public readonly spotifyId: string,
    public readonly displayName: string,
    public readonly email: string,
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly tokenExpiresAt: Date,
    public readonly profileImage?: string,
  ) {}

  isTokenExpired(): boolean {
    return new Date() >= this.tokenExpiresAt;
  }

  updateTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): User {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    return new User(
      this.spotifyId,
      this.displayName,
      this.email,
      accessToken,
      refreshToken,
      expiresAt,
      this.profileImage,
    );
  }
}
