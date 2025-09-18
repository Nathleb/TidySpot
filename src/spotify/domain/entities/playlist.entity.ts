export class Playlist {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly trackCount: number,
    public readonly externalUrl: string,
    public readonly imageUrl?: string,
    public isUsedForSorting: boolean = false,
  ) {}

  toggleUsedForSorting(): void {
    this.isUsedForSorting = !this.isUsedForSorting;
  }
}
