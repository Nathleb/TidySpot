import { Module } from '@nestjs/common/decorators/modules';
import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [SpotifyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
