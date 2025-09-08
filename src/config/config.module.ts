import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import spotifyConfig from './spotify.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [spotifyConfig],
    }),
  ],
})
export class AppConfigModule {}
