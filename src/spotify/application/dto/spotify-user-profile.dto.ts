export interface SpotifyUserProfileDto {
  id: string;
  display_name: string;
  email?: string;
  images?: Array<{ url: string; width?: number; height?: number }>;
  external_urls?: { spotify: string };
  country?: string;
  followers?: { total: number };
}

/**
 * Maps a Spotify API user profile object to a SpotifyUserProfileDto.
 * @param {SpotifyApi.CurrentUsersProfileResponse} userProfile The raw user profile object from the Spotify API.
 * @returns {SpotifyUserProfileDto} A DTO representing the user's profile.
 */
export const mapToSpotifyUserProfileDto = (
  userProfile: SpotifyApi.CurrentUsersProfileResponse,
): SpotifyUserProfileDto => {
  return {
    id: userProfile.id,
    display_name: userProfile.display_name || 'Anonymous User',
    email: userProfile.email,
    images: userProfile.images?.map((image) => ({
      url: image.url,
      width: image.width,
      height: image.height,
    })),
    country: userProfile.country,
    followers: userProfile.followers,
    external_urls: userProfile.external_urls,
  };
};
