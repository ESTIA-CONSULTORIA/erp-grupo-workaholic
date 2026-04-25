"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./common/prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const companies_module_1 = require("./modules/companies/companies.module");
const flow_module_1 = require("./modules/flow/flow.module");
const cuts_module_1 = require("./modules/cuts/cuts.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const cxc_module_1 = require("./modules/cxc/cxc.module");
const cxp_module_1 = require("./modules/cxp/cxp.module");
const suppliers_module_1 = require("./modules/suppliers/suppliers.module");
const documents_module_1 = require("./modules/documents/documents.module");
const reports_module_1 = require("./modules/reports/reports.module");
const machete_module_1 = require("./modules/machete/machete.module");
const rh_module_1 = require("./modules/rh/rh.module");
const bulk_import_module_1 = require("./modules/bulk-import/bulk-import.module");
const audit_module_1 = require("./modules/audit/audit.module");
const approvals_module_1 = require("./modules/approvals/approvals.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const incidents_module_1 = require("./modules/incidents/incidents.module");
const disabilities_module_1 = require("./modules/disabilities/disabilities.module");
const terminations_module_1 = require("./modules/terminations/terminations.module");
const legal_module_1 = require("./modules/legal/legal.module");
const payroll_receipts_module_1 = require("./modules/payroll-receipts/payroll-receipts.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const permissions_service_1 = require("./modules/permissions/permissions.service");
const lonche_module_1 = require("./modules/lonche/lonche.module");
const workaholic_module_1 = require("./modules/workaholic/workaholic.module");
const palestra_module_1 = require("./modules/palestra/palestra.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const intercompany_module_1 = require("./modules/intercompany/intercompany.module");
const corte_caja_module_1 = require("./modules/corte-caja/corte-caja.module");
let AppModule = class AppModule {
    constructor(httpAdapterHost, permissionsService) {
        this.httpAdapterHost = httpAdapterHost;
        this.permissionsService = permissionsService;
    }
    onModuleInit() {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        if (!httpAdapter)
            return;
        console.log('✅ AppModule listo');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            flow_module_1.FlowModule,
            cuts_module_1.CutsModule,
            expenses_module_1.ExpensesModule,
            cxc_module_1.CxcModule,
            cxp_module_1.CxpModule,
            suppliers_module_1.SuppliersModule,
            documents_module_1.DocumentsModule,
            reports_module_1.ReportsModule,
            machete_module_1.MacheteModule,
            rh_module_1.RhModule,
            bulk_import_module_1.BulkImportModule,
            audit_module_1.AuditModule,
            lonche_module_1.LoncheModule,
            workaholic_module_1.WorkaholicModule,
            palestra_module_1.PalestraModule,
            approvals_module_1.ApprovalsModule,
            notifications_module_1.NotificationsModule,
            incidents_module_1.IncidentsModule,
            disabilities_module_1.DisabilitiesModule,
            terminations_module_1.TerminationsModule,
            legal_module_1.LegalModule,
            payroll_receipts_module_1.PayrollReceiptsModule,
            permissions_module_1.PermissionsModule,
            maintenance_module_1.MaintenanceModule,
            intercompany_module_1.IntercompanyModule,
            corte_caja_module_1.CorteCajaModule,
        ],
    }),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost,
        permissions_service_1.PermissionsService])
], AppModule);
//# sourceMappingURL=app.module.js.map