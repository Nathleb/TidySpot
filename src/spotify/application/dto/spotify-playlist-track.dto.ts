import { SpotifyTrackDto } from './spotify-track.dto';

export interface SpotifyPlaylistTrackDto {
  added_at: string;
  added_by?: { id: string };
  track: SpotifyTrackDto;
}

/**
 * Maps a Spotify API playlist item to a SpotifyPlaylistTrackDto.
 * @param {any} item The raw playlist item from the Spotify API.
 * @returns {SpotifyPlaylistTrackDto} A DTO representing the playlist track.
 * @throws {Error} Throws an error if the item's track is null.
 */
export const mapToSpotifyPlaylistTrackDto = (
  item: any,
): SpotifyPlaylistTrackDto => {
  if (!item.track) {
    throw new Error('Track is null and cannot be mapped.');
  }

  return {
    added_at: item.added_at,
    added_by: item.added_by ? { id: item.added_by.id } : undefined,
    track: {
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
      })),
      album: {
        id: item.track.album.id,
        name: item.track.album.name,
        images: item.track.album.images?.map((image: any) => ({
          url: image.url,
          width: image.width,
          height: image.height,
        })),
      },
      preview_url: item.track.preview_url,
      external_urls: item.track.external_urls,
      duration_ms: item.track.duration_ms,
      popularity: item.track.popularity,
    },
  };
};
