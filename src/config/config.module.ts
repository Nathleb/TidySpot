import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import spotifyConfig from './spotify.config';
import sessionConfig from './session.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [spotifyConfig, sessionConfig],
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
