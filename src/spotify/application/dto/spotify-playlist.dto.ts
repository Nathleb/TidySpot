export interface SpotifyPlaylistDto {
  id: string;
  name: string;
  description?: string;
  owner: { id: string; display_name?: string };
  public: boolean;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
  }>;
  external_urls?: { spotify: string };
  tracks?: { total: number };
}

/**
 * Maps a Spotify API playlist object to a SpotifyPlaylistDto.
 * @param {SpotifyApi.PlaylistObjectSimplified} playlist The raw playlist object.
 * @returns {SpotifyPlaylistDto} The mapped DTO.
 */
export const mapToSpotifyPlaylistDto = (
  playlist: SpotifyApi.PlaylistObjectSimplified,
): SpotifyPlaylistDto => {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || '',
    owner: {
      id: playlist.owner.id,
      display_name: playlist.owner.display_name,
    },
    public: playlist.public || false,
    images: playlist.images,
    external_urls: playlist.external_urls,
    tracks: playlist.tracks,
  };
};
