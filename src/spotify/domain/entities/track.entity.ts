export class Track {
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
}
