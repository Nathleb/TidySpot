import { SpotifyPlaylistDto } from 'src/spotify/application/dto/spotify-playlist.dto';

export class Playlist {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly ownerId: string,
    public readonly isPublic: boolean,
    public readonly imageUrl?: string,
    public readonly spotifyUrl?: string,
    public readonly totalTracks: number = 0,
    public readonly isUsedForSorting: boolean = false,
    public readonly updatedAt: Date = new Date(),
  ) {}

  static fromSpotifyPlaylist(playlist: SpotifyPlaylistDto): Playlist {
    return new Playlist(
      playlist.id,
      playlist.name,
      playlist.description || '',
      playlist.owner.id,
      playlist.public,
      playlist.images?.[0]?.url,
      playlist.external_urls?.spotify,
      playlist.tracks?.total || 0,
      true,
    );
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId;
  }

  toggleUsedForSorting(): Playlist {
    return new Playlist(
      this.id,
      this.name,
      this.description,
      this.ownerId,
      this.isPublic,
      this.imageUrl,
      this.spotifyUrl,
      this.totalTracks,
      !this.isUsedForSorting,
      this.updatedAt,
    );
  }

  get trackCount(): number {
    return this.totalTracks;
  }
}
