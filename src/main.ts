import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./certificates/localhost+1-key.pem'),
    cert: fs.readFileSync('./certificates/localhost+1.pem'),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
