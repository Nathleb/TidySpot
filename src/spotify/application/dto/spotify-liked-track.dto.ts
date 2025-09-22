import { SpotifyTrackDto } from './spotify-track.dto';

export interface SpotifyLikedTrackDto {
  added_at: string;
  track: SpotifyTrackDto;
}

/**
 * Maps an item from the Spotify "liked songs" API response to a SpotifyLikedTrackDto object.
 * @param {any} item - The item object from the Spotify API response.
 * @returns {SpotifyLikedTrackDto} The mapped DTO object.
 */
export const mapToSpotifyLikedTrackDto = (item: any): SpotifyLikedTrackDto => {
  if (!item.track) {
    throw new Error('Track is null and cannot be mapped.');
  }

  return {
    added_at: item.added_at,
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
