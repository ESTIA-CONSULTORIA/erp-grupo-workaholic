import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule }   from './common/prisma/prisma.module';
import { AuthModule }     from './modules/auth/auth.module';
import { UsersModule }    from './modules/users/users.module';
import { CompaniesModule }from './modules/companies/companies.module';
import { BranchesModule } from './modules/branches/branches.module';
import { FinancialSchemaModule } from './modules/financial-schema/financial-schema.module';
import { CutsModule }     from './modules/cuts/cuts.module';
import { FlowModule }     from './modules/flow/flow.module';
import { CxcModule }      from './modules/cxc/cxc.module';
import { CxpModule }      from './modules/cxp/cxp.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PurchasesModule }from './modules/purchases/purchases.module';
import { ReportsModule }  from './modules/reports/reports.module';
import { DocumentsModule }from './modules/documents/documents.module';
import { MacheteModule }  from './modules/machete/machete.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    BranchesModule,
    FinancialSchemaModule,
    CutsModule,
    FlowModule,
    CxcModule,
    CxpModule,
    ExpensesModule,
    PurchasesModule,
    ReportsModule,
    DocumentsModule,
    MacheteModule,
  ],
})
export class AppModule {}
