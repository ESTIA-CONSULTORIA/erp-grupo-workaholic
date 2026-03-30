import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { FlowModule } from './modules/flow/flow.module';
import { CutsModule } from './modules/cuts/cuts.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CxcModule } from './modules/cxc/cxc.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MacheteModule } from './modules/machete/machete.module';
import { RhModule } from './modules/rh/rh.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompaniesModule,
    FlowModule,
    CutsModule,
    ExpensesModule,
    CxcModule,
    DocumentsModule,
    ReportsModule,
    MacheteModule,
    RhModule,
  ],
})
export class AppModule {}