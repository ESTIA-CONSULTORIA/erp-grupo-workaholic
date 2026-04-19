import { Module } from '@nestjs/common';
import { PalestraController } from './palestra.controller';
import { PalestraService } from './palestra.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PalestraController],
  providers: [PalestraService],
})
export class PalestraModule {}
