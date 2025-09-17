import { AuthController } from './infrastructure/controllers/auth.controller';
import { SpotifyApiAdapter } from './infrastructure/adapters/spotify-api.adapter';
import { SpotifyAuthService } from './application/services/spotify-auth.service';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SpotifyClientPort } from './domain/ports/spotify-client.port';
import { UserRepositoryPort } from './domain/ports/user-repository.port';
import { UserRepository } from './infrastructure/adapters/user.repository';
import { AppConfigModule } from 'src/config/config.module';
import { SpotifyAuthSessionRepositoryPort } from './domain/ports/spotify-auth-session-repository.port';
import { SpotifyAuthSessionRepository } from './infrastructure/adapters/spotify-auth-session.repository';
import { SessionMiddleware } from './infrastructure/middleware/session.middleware';
import { SpotifyAuthGuard } from './infrastructure/guards/spotifyAuth.guards';
import { UserController } from './infrastructure/controllers/user.controller';
import { SpotifyUserService } from './application/services/spotify-user.service';

@Module({
  imports: [HttpModule, ConfigModule, AppConfigModule],
  controllers: [AuthController, UserController],
  providers: [
    SpotifyAuthService,
    SpotifyUserService,
    {
      provide: SpotifyClientPort,
      useClass: SpotifyApiAdapter,
    },
    {
      provide: UserRepositoryPort,
      useClass: UserRepository,
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
    consumer.apply(SessionMiddleware).forRoutes('auth/spotify/', 'users/');
  }
}
