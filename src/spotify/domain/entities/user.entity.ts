export class User {
  constructor(
    public readonly spotifyId: string,
    public readonly displayName: string,
    public readonly email: string,
    public readonly profileImage?: string,
  ) {}
}

//methode constructeur avec apiSPotify
