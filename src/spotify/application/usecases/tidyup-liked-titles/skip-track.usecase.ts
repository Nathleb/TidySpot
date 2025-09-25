// import { Injectable } from '@nestjs/common';
// import { PlaylistTrack } from 'src/spotify/domain/entities/playlist-track.entity';
// import { PlaylistRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-repository.port';
// import { PlaylistTrackRepositoryPort } from 'src/spotify/domain/ports/repositories/playlist-track-repository.port';
// import { SpotifyTrackClientPort } from 'src/spotify/domain/ports/spotify-client/spotify-track-client.port';

// export interface SkipTrackCommand {
//   accessToken: string;
//   trackId: string;
//   userId: string;
// }

// @Injectable()
// export class SkipTrackUseCase {
//   constructor(
//     private readonly playlistRepository: PlaylistRepositoryPort,
//     private readonly playlistTrackRepository: PlaylistTrackRepositoryPort,
//     private readonly SpotifyTrackClient: SpotifyTrackClientPort,
//   ) {}

//   async execute(command: SkipTrackCommand): Promise<PlaylistTrack> {
//     const { accessToken, trackId, userId } = command;

//     try {
//       await this.playlistTrackRepository.addTrackToPlaylist(
//         playlistId,
//         playlistTrack,
//       );

//       return playlistTrack;
//     } catch (error) {
//       // TODO: differentiate between repository errors and spotify errors
//       // TODO: Consider rollback strategies if Spotify succeeds but DB fails
//       throw error;
//     }
//   }
// }
