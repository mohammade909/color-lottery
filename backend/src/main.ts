import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  app.enableCors(); // Enable CORS for frontend integration
  await app.listen(8800);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();