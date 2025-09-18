import { Playlist } from '../../domain/entities/playlist.entity';

export class PlaylistDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly trackCount: number,
    public readonly externalUrl: string,
    public readonly isUsedForSorting: boolean,
    public readonly imageUrl?: string,
  ) {}

  static fromPlaylist(playlist: Playlist): PlaylistDto {
    return new PlaylistDto(
      playlist.id,
      playlist.name,
      playlist.description,
      playlist.trackCount,
      playlist.externalUrl,
      playlist.isUsedForSorting,
      playlist.imageUrl,
    );
  }
}
