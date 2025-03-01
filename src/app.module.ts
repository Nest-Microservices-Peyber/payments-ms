/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PaimentsModule } from './paiments/paiments.module';

@Module({
  imports: [PaimentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
