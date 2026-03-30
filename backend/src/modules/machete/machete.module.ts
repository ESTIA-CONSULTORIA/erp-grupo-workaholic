import { Module } from '@nestjs/common';
import { MacheteService } from './machete.service';
import { MacheteController } from './machete.controller';

@Module({
  providers: [MacheteService],
  controllers: [MacheteController],
})
export class MacheteModule {}
