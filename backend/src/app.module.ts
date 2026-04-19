import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { FlowModule } from './modules/flow/flow.module';
import { CutsModule } from './modules/cuts/cuts.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { CxcModule } from './modules/cxc/cxc.module';
import { CxpModule } from './modules/cxp/cxp.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MacheteModule } from './modules/machete/machete.module';
import { RhModule } from './modules/rh/rh.module';
import { BulkImportModule } from './modules/bulk-import/bulk-import.module';
import { AuditModule } from './modules/audit/audit.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PalestraModule } from './modules/palestra/palestra.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { IntercompanyModule } from './modules/intercompany/intercompany.module';
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
    SuppliersModule,
    DocumentsModule,
    ReportsModule,
    MacheteModule,
    RhModule,
    BulkImportModule,
    AuditModule,
    PalestraModule,
    PermissionsModule,
    MaintenanceModule,
    IntercompanyModule,
    CorteCajaModule,
  ],
})
export class AppModule {}
