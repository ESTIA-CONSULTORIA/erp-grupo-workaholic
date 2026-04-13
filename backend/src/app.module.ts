import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { FlowModule } from './modules/flow/flow.module';
import { CutsModule } from './modules/cuts/cuts.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CxcModule } from './modules/cxc/cxc.module';
import { CxpModule } from './modules/cxp/cxp.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MacheteModule } from './modules/machete/machete.module';
import { RhModule } from './modules/rh/rh.module';
import { CorteCajaModule } from './modules/corte-caja/corte-caja.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CompaniesModule,
    FlowModule,
    CutsModule,
    ExpensesModule,
    CxcModule,
    CxpModule,
    DocumentsModule,
    ReportsModule,
    MacheteModule,
    RhModule,
    CorteCajaModule,
  ],
})
export class AppModule {}
