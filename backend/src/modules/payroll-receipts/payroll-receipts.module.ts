import { Module } from '@nestjs/common';
import { PayrollReceiptsController } from './payroll-receipts.controller';
import { PayrollReceiptsService } from './payroll-receipts.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
@Module({ imports:[PrismaModule], controllers:[PayrollReceiptsController], providers:[PayrollReceiptsService], exports:[PayrollReceiptsService] })
export class PayrollReceiptsModule {}
