import { Module } from '@nestjs/common';
import { WorkaholicController } from './workaholic.controller';
import { WorkaholicService } from './workaholic.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkaholicController],
  providers: [WorkaholicService],
  exports: [WorkaholicService],
})
export class WorkaholicModule {}
