// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ArqueoContadorService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, body: any) {
    const folio = `ARQ-${Date.now()}`;

    const differenceVisibleAt = new Date(Date.now() + 5 * 60 * 1000);

    const record = await this.prisma.$executeRawUnsafe(`
      INSERT INTO "contador_arqueos"
      ("id","companyId","createdById","folio","declaredJson","systemJson","summaryJson","notes","differenceVisibleAt")
      VALUES
      (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8)
    `,
      companyId,
      userId,
      folio,
      JSON.stringify(body.declared),
      JSON.stringify(body.system),
      JSON.stringify(body.summary),
      body.notes || null,
      differenceVisibleAt
    );

    return { folio, ok: true };
  }

  async findAll(companyId: string) {
    return this.prisma.$queryRawUnsafe(`
      SELECT * FROM "contador_arqueos"
      WHERE "companyId" = $1
      ORDER BY "createdAt" DESC
      LIMIT 50
    `, companyId);
  }
}
