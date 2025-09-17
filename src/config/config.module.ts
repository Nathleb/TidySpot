import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import spotifyConfig from './spotify.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [spotifyConfig],
      isGlobal: true,
    }),
  ],
})
export class AppConfigModule {}
