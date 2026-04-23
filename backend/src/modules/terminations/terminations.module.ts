import { Module } from '@nestjs/common';
import { TerminationsController } from './terminations.controller';
import { TerminationsService } from './terminations.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
@Module({ imports:[PrismaModule], controllers:[TerminationsController], providers:[TerminationsService], exports:[TerminationsService] })
export class TerminationsModule {}
