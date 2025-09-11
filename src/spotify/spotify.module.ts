import { AuthController } from './infrastructure/controllers/auth.controller';
import { SpotifyApiAdapter } from './infrastructure/adapters/spotify-api.adapter';
import { SpotifyAuthService } from './application/services/spotify-auth.service';
import { Module } from '@nestjs/common/decorators/modules';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SpotifyClientPort } from './domain/ports/spotify-client.port';
import { UserRepositoryPort } from './domain/ports/user-repository.port';
import { UserRepository } from './infrastructure/adapters/user.repository';
import { AppConfigModule } from 'src/config/config.module';

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
  ],
})
export class SpotifyModule {}
