// ─── period-closure.service.ts ────────────────────────────────
// Cierre mensual: bloquea el período y guarda snapshot del ER
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PeriodClosureService {
  constructor(private prisma: PrismaService) {}

  async getClosure(companyId: string, period: string) {
    return this.prisma.periodClosure.findUnique({
      where: { companyId_period: { companyId, period } },
    });
  }

  async initPeriod(companyId: string, period: string) {
    return this.prisma.periodClosure.upsert({
      where:  { companyId_period: { companyId, period } },
      update: {},
      create: { companyId, period, status: 'ABIERTO' },
    });
  }

  async closePeriod(
    companyId: string,
    period:    string,
    userId:    string,
    snapshots: {
      incomeStatement: any;
      cashFlowSummary: any;
      balanceSummary:  any;
      notes?:          string;
    }
  ) {
    const existing = await this.prisma.periodClosure.findUnique({
      where: { companyId_period: { companyId, period } },
    });

    if (existing?.status === 'CERRADO')
      throw new BadRequestException(`El período ${period} ya está cerrado`);

    // Verificar que no haya cortes pendientes de aprobación
    const [y, m] = period.split('-').map(Number);
    const pendingCuts = await this.prisma.cut.count({
      where: {
        companyId,
        date:   { gte: new Date(y, m-1, 1), lte: new Date(y, m, 0) },
        status: { in: ['BORRADOR', 'ENVIADO'] },
      },
    });
    if (pendingCuts > 0)
      throw new BadRequestException(
        `Hay ${pendingCuts} corte(s) sin aprobar. Apruébalos antes de cerrar el período.`
      );

    const closure = await this.prisma.periodClosure.upsert({
      where:  { companyId_period: { companyId, period } },
      update: {
        status:          'CERRADO',
        closedAt:        new Date(),
        closedById:      userId,
        incomeStatement: snapshots.incomeStatement,
        cashFlowSummary: snapshots.cashFlowSummary,
        balanceSummary:  snapshots.balanceSummary,
        notes:           snapshots.notes,
      },
      create: {
        companyId,
        period,
        status:          'CERRADO',
        closedAt:        new Date(),
        closedById:      userId,
        incomeStatement: snapshots.incomeStatement,
        cashFlowSummary: snapshots.cashFlowSummary,
        balanceSummary:  snapshots.balanceSummary,
        notes:           snapshots.notes,
      },
    });

    // Auditoría
    await this.prisma.auditLog.create({
      data: {
        userId,
        companyId,
        action:   'CLOSE_PERIOD',
        entity:   'period_closures',
        entityId: closure.id,
        after:    { period, closedAt: new Date() },
      },
    });

    return closure;
  }

  async listClosures(companyId: string) {
    return this.prisma.periodClosure.findMany({
      where:   { companyId },
      orderBy: { period: 'desc' },
    });
  }

  isPeriodClosed(closure: any): boolean {
    return closure?.status === 'CERRADO';
  }
}
