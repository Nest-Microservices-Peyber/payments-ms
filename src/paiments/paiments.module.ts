import { Module } from '@nestjs/common';
import { PaimentsService } from './paiments.service';
import { PaimentsController } from './paiments.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [PaimentsController],
  providers: [PaimentsService],
  imports: [NatsModule]
})
export class PaimentsModule {}
