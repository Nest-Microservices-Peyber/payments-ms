/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true
  });
  const logger = new Logger('Paiments-ms');

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
  );
  
  await app.listen(envs.port);
  logger.log(`Orders Microservices running on port: ${envs.port}`)
}
bootstrap();
