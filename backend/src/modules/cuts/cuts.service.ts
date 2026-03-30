import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CutsService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, period?: string) {
    const where: any = { companyId };
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.cut.findMany({
      where,
      include: {
        lines: { include: { rubric: true } },
        branch: true,
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  create(companyId: string, userId: string, data: any) {
    const nextFolio = `C-${Date.now()}`;
    return this.prisma.cut.create({
      data: {
        companyId,
        branchId:    data.branchId,
        createdById: userId,
        folio:       nextFolio,
        date:        new Date(data.date),
        notes:       data.notes,
        status:      'BORRADOR',
        lines: {
          create: data.lines.map((l: any) => ({
            rubricId:      l.rubricId,
            paymentType:   l.paymentType || 'CONTADO',
            currency:      l.currency    || 'MXN',
            cashAccountId: l.cashAccountId || null,
            clientId:      l.clientId      || null,
            grossAmount:   l.grossAmount   || 0,
            discount:      l.discount      || 0,
            courtesy:      l.courtesy      || 0,
            netAmount:     (l.grossAmount || 0) - (l.discount || 0) - (l.courtesy || 0),
          })),
        },
      },
      include: { lines: { include: { rubric: true } } },
    });
  }

  submit(id: string) {
    return this.prisma.cut.update({ where: { id }, data: { status: 'ENVIADO' } });
  }

  approve(id: string) {
    return this.prisma.cut.update({ where: { id }, data: { status: 'APROBADO' } });
  }
}
