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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const MIGRATION_SECRET = 'workaholic-migrate-2026';
let MigrateController = class MigrateController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async status(secret) {
        if (secret !== MIGRATION_SECRET)
            return { error: 'Unauthorized' };
        const tables = await this.prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
        return { tables };
    }
    async run(secret) {
        if (secret !== MIGRATION_SECRET)
            return { error: 'Unauthorized' };
        const results = [];
        const run = async (label, sql) => {
            try {
                await this.prisma.$executeRawUnsafe(sql);
                results.push({ ok: true, label });
            }
            catch (e) {
                results.push({ ok: false, label, error: e.message });
            }
        };
        await run('intercompany folio', `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS folio TEXT`);
        await run('intercompany fromCashAccountId', `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "fromCashAccountId" TEXT`);
        await run('intercompany toCashAccountId', `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "toCashAccountId" TEXT`);
        await run('intercompany rejectedReason', `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT`);
        await run('sales discount', `ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0`);
        await run('sales paymentSplits', `ALTER TABLE sales ADD COLUMN IF NOT EXISTS "paymentSplits" JSONB`);
        await run('cortes_caja folio', `ALTER TABLE cortes_caja ADD COLUMN IF NOT EXISTS folio TEXT`);
        await run('employee_contracts table', `
      CREATE TABLE IF NOT EXISTS employee_contracts (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        "employeeId" TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'INDEFINIDO',
        "startDate" DATE NOT NULL,
        "endDate" DATE,
        "salaryAtSigning" DECIMAL(12,2) NOT NULL DEFAULT 0,
        position TEXT NOT NULL DEFAULT '',
        "workSchedule" TEXT,
        status TEXT NOT NULL DEFAULT 'VIGENTE',
        "legalDocumentId" TEXT,
        notes TEXT,
        "signedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
        await run('workaholic_services table', `
      CREATE TABLE IF NOT EXISTS workaholic_services (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'SERVICIO',
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
        await run('workaholic_spaces table', `
      CREATE TABLE IF NOT EXISTS workaholic_spaces (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'SALA_JUNTAS',
        description TEXT,
        capacity INTEGER DEFAULT 1,
        "pricePerHour" DECIMAL(12,2),
        "pricePerDay" DECIMAL(12,2),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
        await run('notifications table', `
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "companyId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        "actionUrl" TEXT,
        priority TEXT NOT NULL DEFAULT 'NORMAL',
        "sourceModule" TEXT,
        "sourceId" TEXT,
        channel TEXT NOT NULL DEFAULT 'IN_APP',
        read BOOLEAN NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
        await run('palestra_products table', `
      CREATE TABLE IF NOT EXISTS palestra_products (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        sku TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'GENERAL',
        description TEXT,
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        cost DECIMAL(12,2) NOT NULL DEFAULT 0,
        stock DECIMAL(10,2) NOT NULL DEFAULT 999,
        "minStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("companyId", sku)
      )
    `);
        await run('payroll_lines baseTimbrado', `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "baseTimbrado" DECIMAL(12,2)`);
        await run('payroll_lines baseEfectivo', `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "baseEfectivo" DECIMAL(12,2)`);
        await run('payroll_lines netTimbrado', `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "netTimbrado" DECIMAL(12,2)`);
        await run('payroll_lines netEfectivo', `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "netEfectivo" DECIMAL(12,2)`);
        await run('vacations paymentType', `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "paymentType" TEXT DEFAULT 'GOZAR'`);
        await run('vacations montoTimbrado', `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoTimbrado" DECIMAL(12,2)`);
        await run('vacations montoEfectivo', `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoEfectivo" DECIMAL(12,2)`);
        await run('vacations montoPrima', `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoPrima" DECIMAL(12,2)`);
        await run('vacations plazoGozar', `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "plazoGozar" DATE`);
        const ok = results.filter(r => r.ok).length;
        const fail = results.filter(r => !r.ok).length;
        return { ok, fail, results };
    }
};
exports.MigrateController = MigrateController;
__decorate([
    (0, common_1.Get)('status'),
    __param(0, (0, common_1.Headers)('x-migrate-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MigrateController.prototype, "status", null);
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, common_1.Headers)('x-migrate-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MigrateController.prototype, "run", null);
exports.MigrateController = MigrateController = __decorate([
    (0, common_1.Controller)('_migrate'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MigrateController);
//# sourceMappingURL=migrate.controller.js.map