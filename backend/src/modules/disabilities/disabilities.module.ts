import { Module } from '@nestjs/common';
import { DisabilitiesController } from './disabilities.controller';
import { DisabilitiesService } from './disabilities.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
@Module({ imports:[PrismaModule], controllers:[DisabilitiesController], providers:[DisabilitiesService], exports:[DisabilitiesService] })
export class DisabilitiesModule {}
