import { AuthController } from './infrastructure/controllers/auth.controller';
import { SpotifyAuthService } from './application/services/spotify-auth.service';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserRepositoryPort } from './domain/ports/repositories/user-repository.port';
import { UserRepository } from './infrastructure/adapters/repositories/user.repository';
import { AppConfigModule } from 'src/config/config.module';
import { SpotifyAuthSessionRepositoryPort } from './domain/ports/repositories/spotify-auth-session-repository.port';
import { SpotifyAuthSessionRepository } from './infrastructure/adapters/repositories/spotify-auth-session.repository';
import { SessionMiddleware } from './infrastructure/middleware/session.middleware';
import { SpotifyAuthGuard } from './infrastructure/guards/spotifyAuth.guards';
import { UsersController } from './infrastructure/controllers/users.controller';
import { SpotifyAuthClientPort } from './domain/ports/spotify-client/spotify-auth-client.port';
import { SpotifyPlaylistClientPort } from './domain/ports/spotify-client/spotify-playlist-client.port';
import { SpotifyTrackClientPort } from './domain/ports/spotify-client/spotify-track-client.port';
import { SpotifyUserClientPort } from './domain/ports/spotify-client/spotify-user-client.port';
import { SpotifyAuthApiAdapter } from './infrastructure/adapters/spotify-api/spotify-auth-api.adapter';
import { SpotifyPlaylistApiAdapter } from './infrastructure/adapters/spotify-api/spotify-playlist-api.adapter';
import { SpotifyTrackApiAdapter } from './infrastructure/adapters/spotify-api/spotify-track-api.adapter';
import { SpotifyUserApiAdapter } from './infrastructure/adapters/spotify-api/spotify-user-api.adapter';
import { PlaylistRepositoryPort } from './domain/ports/repositories/playlist-repository.port';
import { PlaylistTrackRepositoryPort } from './domain/ports/repositories/playlist-track-repository.port';
import { LikedTrackRepositoryPort } from './domain/ports/repositories/liked-track-repository.port';
import { LikedTrackRepository } from './infrastructure/adapters/repositories/liked-track.repository';
import { PlaylistTrackRepository } from './infrastructure/adapters/repositories/playlist-track.repository';
import { PlaylistRepository } from './infrastructure/adapters/repositories/playlist.repository';
import { SyncSpotifyAccountUseCase } from './application/usecases/synchronise-spotify-profile/sync-spotify-account.usecase';

@Module({
  imports: [HttpModule, ConfigModule, AppConfigModule],
  controllers: [AuthController, UsersController],
  providers: [
    SyncSpotifyAccountUseCase,
    SpotifyAuthService,
    {
      provide: SpotifyAuthClientPort,
      useClass: SpotifyAuthApiAdapter,
    },
    {
      provide: SpotifyTrackClientPort,
      useClass: SpotifyTrackApiAdapter,
    },
    {
      provide: SpotifyUserClientPort,
      useClass: SpotifyUserApiAdapter,
    },
    {
      provide: SpotifyPlaylistClientPort,
      useClass: SpotifyPlaylistApiAdapter,
    },
    {
      provide: UserRepositoryPort,
      useClass: UserRepository,
    },
    {
      provide: PlaylistRepositoryPort,
      useClass: PlaylistRepository,
    },
    {
      provide: PlaylistTrackRepositoryPort,
      useClass: PlaylistTrackRepository,
    },
    {
      provide: LikedTrackRepositoryPort,
      useClass: LikedTrackRepository,
    },
    {
      provide: SpotifyAuthSessionRepositoryPort,
      useClass: SpotifyAuthSessionRepository,
    },
    SpotifyAuthGuard,
  ],
})
export class SpotifyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes(AuthController, UsersController);
  }
}
