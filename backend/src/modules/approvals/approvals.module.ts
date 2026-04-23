import { Module } from '@nestjs/common';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
@Module({ imports:[PrismaModule], controllers:[ApprovalsController], providers:[ApprovalsService], exports:[ApprovalsService] })
export class ApprovalsModule {}
