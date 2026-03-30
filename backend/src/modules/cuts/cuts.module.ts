import { Module } from '@nestjs/common';
import { CutsService } from './cuts.service';
import { CutsController } from './cuts.controller';

@Module({
  providers: [CutsService],
  controllers: [CutsController],
})
export class CutsModule {}
