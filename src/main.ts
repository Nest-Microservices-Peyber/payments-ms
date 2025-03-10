/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import {  MicroserviceOptions, Transport } from '@nestjs/microservices';


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

  //? Confuracion para micro servicios
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: envs.natsServers,
    },
  },{
    inheritAppConfig: true
  });
  
  await app.startAllMicroservices();
  
  await app.listen(envs.port);
  logger.log(`Orders Microservices running on port: ${envs.port}`)
}
bootstrap();
