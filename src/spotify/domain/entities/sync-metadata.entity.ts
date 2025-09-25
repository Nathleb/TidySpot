export class SyncMetadataEntity {
  constructor(
    public readonly userId: string,
    public readonly lastFullSync: Date,
    public readonly lastQuickSync: Date,
    public readonly playlistSnapshots: Record<string, string>,
  ) {}
}
