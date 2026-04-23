import { Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
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
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { DisabilitiesModule } from './modules/disabilities/disabilities.module';
import { TerminationsModule } from './modules/terminations/terminations.module';
import { LegalModule } from './modules/legal/legal.module';
import { PayrollReceiptsModule } from './modules/payroll-receipts/payroll-receipts.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PermissionsService } from './modules/permissions/permissions.service';
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
    ApprovalsModule,
    NotificationsModule,
    IncidentsModule,
    DisabilitiesModule,
    TerminationsModule,
    LegalModule,
    PayrollReceiptsModule,
    PermissionsModule,
    MaintenanceModule,
    IntercompanyModule,
    CorteCajaModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly permissionsService: PermissionsService,
  ) {}

  onModuleInit() {
    const httpAdapter = this.httpAdapterHost.httpAdapter;
    if (!httpAdapter) return;

    // Registrar rutas de permisos manualmente para asegurar que estén disponibles
    httpAdapter.get('/api/v1/permissions/defaults', (req, res) => {
      res.status(200).json(this.permissionsService.getDefaultPermissions());
    });

    httpAdapter.get('/api/v1/permissions/all', async (req, res) => {
      const companyId = req.query.companyId as string;
      const all = await this.permissionsService.getAllPermissions(companyId);
      res.status(200).json(all);
    });

    httpAdapter.put('/api/v1/permissions/roles/:roleCode/modules/:module/actions/:action', async (req, res) => {
      const { roleCode, module, action } = req.params;
      const { allowed, companyId } = req.body;
      const updated = await this.permissionsService.updatePermission(roleCode, module, action, allowed, companyId);
      res.status(200).json(updated);
    });

    console.log('✅ Rutas de permisos registradas desde AppModule');
  }
}
