// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ArqueoContadorService {
  constructor(private prisma: PrismaService) {}

  private async ensureTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "contador_arqueos" (
        "id" TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        "createdById" TEXT,
        "folio" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "declaredJson" JSONB NOT NULL,
        "systemJson" JSONB NOT NULL,
        "summaryJson" JSONB NOT NULL,
        "notes" TEXT,
        "status" TEXT NOT NULL DEFAULT 'ENVIADO',
        "differenceVisibleAt" TIMESTAMP(3) NOT NULL,
        "reviewedById" TEXT,
        "reviewedAt" TIMESTAMP(3),
        "reviewNotes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "contador_arqueos_companyId_folio_key"
      ON "contador_arqueos"("companyId", "folio")
    `);

    await this.prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "contador_arqueos_companyId_date_idx"
      ON "contador_arqueos"("companyId", "date")
    `);
  }

  async create(companyId: string, userId: string | null, body: any) {
    await this.ensureTable();

    const id = randomUUID();
    const folio = `ARQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;
    const differenceVisibleAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO "contador_arqueos"
      ("id", "companyId", "createdById", "folio", "declaredJson", "systemJson", "summaryJson", "notes", "differenceVisibleAt")
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8, $9)`,
      id,
      companyId,
      userId,
      folio,
      JSON.stringify(body?.declared || {}),
      JSON.stringify(body?.system || {}),
      JSON.stringify(body?.summary || {}),
      body?.notes || null,
      differenceVisibleAt,
    );

    return { id, folio, ok: true, differenceVisibleAt };
  }

  async findAll(companyId: string) {
    await this.ensureTable();

    return this.prisma.$queryRawUnsafe(
      `SELECT * FROM "contador_arqueos"
       WHERE "companyId" = $1
       ORDER BY "createdAt" DESC
       LIMIT 50`,
      companyId,
    );
  }
}
