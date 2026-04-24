import { Module } from '@nestjs/common';
import { LoncheController } from './lonche.controller';
import { LoncheService } from './lonche.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
@Module({ imports:[PrismaModule], controllers:[LoncheController], providers:[LoncheService] })
export class LoncheModule {}
