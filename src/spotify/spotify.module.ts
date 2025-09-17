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

@Module({
  imports: [HttpModule, ConfigModule, AppConfigModule],
  controllers: [AuthController],
  providers: [
    SpotifyAuthService,
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
  ],
})
export class SpotifyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('auth/spotify');
  }
}
