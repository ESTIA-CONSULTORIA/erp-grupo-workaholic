import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ArqueoContadorService } from './arqueo-contador.service';
import { ArqueoContadorController } from './arqueo-contador.controller';

@Module({
  imports: [PrismaModule],
  providers: [ArqueoContadorService],
  controllers: [ArqueoContadorController],
})
export class ArqueoContadorModule {}
