import { Track } from '../../domain/entities/track.entity';

export class TrackDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly artists: string[],
    public readonly album: string,
    public readonly albumArt: string,
    public readonly previewUrl: string | null,
    public readonly durationMs: number,
    public readonly externalUrl: string,
  ) {}

  static fromEntity(entity: Track): TrackDto {
    return new TrackDto(
      entity.id,
      entity.name,
      entity.artists,
      entity.album,
      entity.albumArt,
      entity.previewUrl,
      entity.durationMs,
      entity.externalUrl,
    );
  }
}
