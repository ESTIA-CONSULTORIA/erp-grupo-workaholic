// src/modules/migrate/migrate.controller.ts
// Endpoint temporal para correr migraciones desde Railway sin CMD
// DELETE THIS FILE after migrations are done

import { Controller, Post, Headers, Get } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const MIGRATION_SECRET = 'workaholic-migrate-2026';

@Controller('_migrate')
export class MigrateController {
  constructor(private prisma: PrismaService) {}

  @Get('status')
  async status(@Headers('x-migrate-secret') secret: string) {
    if (secret !== MIGRATION_SECRET) return { error: 'Unauthorized' };
    
    const tables = await this.prisma.$queryRawUnsafe(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    return { tables };
  }

  @Post('run')
  async run(@Headers('x-migrate-secret') secret: string) {
    if (secret !== MIGRATION_SECRET) return { error: 'Unauthorized' };

    const results: any[] = [];
    const run = async (label: string, sql: string) => {
      try {
        await this.prisma.$executeRawUnsafe(sql);
        results.push({ ok: true, label });
      } catch(e: any) {
        results.push({ ok: false, label, error: e.message });
      }
    };

    // ── intercompany_transfers ──────────────────────────────
    await run('intercompany folio',
      `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS folio TEXT`);
    await run('intercompany fromCashAccountId',
      `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "fromCashAccountId" TEXT`);
    await run('intercompany toCashAccountId',
      `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "toCashAccountId" TEXT`);
    await run('intercompany rejectedReason',
      `ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT`);

    // ── sales ───────────────────────────────────────────────
    await run('sales discount',
      `ALTER TABLE sales ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0`);
    await run('sales paymentSplits',
      `ALTER TABLE sales ADD COLUMN IF NOT EXISTS "paymentSplits" JSONB`);

    // ── cortes_caja ─────────────────────────────────────────
    await run('cortes_caja folio',
      `ALTER TABLE cortes_caja ADD COLUMN IF NOT EXISTS folio TEXT`);

    // ── employee_contracts ──────────────────────────────────
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

    // ── workaholic_services ─────────────────────────────────
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

    // ── workaholic_spaces ───────────────────────────────────
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

    // ── notifications ───────────────────────────────────────
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

    // ── palestra_products ───────────────────────────────────
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

    // ── payroll split fields ────────────────────────────────
    await run('payroll_lines baseTimbrado',
      `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "baseTimbrado" DECIMAL(12,2)`);
    await run('payroll_lines baseEfectivo',
      `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "baseEfectivo" DECIMAL(12,2)`);
    await run('payroll_lines netTimbrado',
      `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "netTimbrado" DECIMAL(12,2)`);
    await run('payroll_lines netEfectivo',
      `ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "netEfectivo" DECIMAL(12,2)`);

    // ── vacation fields ─────────────────────────────────────
    await run('vacations paymentType',
      `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "paymentType" TEXT DEFAULT 'GOZAR'`);
    await run('vacations montoTimbrado',
      `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoTimbrado" DECIMAL(12,2)`);
    await run('vacations montoEfectivo',
      `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoEfectivo" DECIMAL(12,2)`);
    await run('vacations montoPrima',
      `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoPrima" DECIMAL(12,2)`);
    await run('vacations plazoGozar',
      `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "plazoGozar" DATE`);

    const ok    = results.filter(r => r.ok).length;
    const fail  = results.filter(r => !r.ok).length;
    return { ok, fail, results };
  }
}
