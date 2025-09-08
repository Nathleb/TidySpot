
import { ConfigModule } from '@nestjs/config';
import spotifyConfig from './spotify.config';
import { Module } from '@nestjs/common/decorators/modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [spotifyConfig],
    }),
  ],
})
export class AppConfigModule { }
