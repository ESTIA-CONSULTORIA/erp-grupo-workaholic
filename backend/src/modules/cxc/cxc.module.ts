import { Module } from '@nestjs/common';
import { CxcService } from './cxc.service';
import { CxcController } from './cxc.controller';

@Module({
  providers: [CxcService],
  controllers: [CxcController],
})
export class CxcModule {}
