import { Module } from '@nestjs/common';
import { PaimentsService } from './paiments.service';
import { PaimentsController } from './paiments.controller';

@Module({
  controllers: [PaimentsController],
  providers: [PaimentsService],
})
export class PaimentsModule {}
