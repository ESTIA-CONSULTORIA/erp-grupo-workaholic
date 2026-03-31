import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, period?: string, isExternal?: string) {
    const where: any = { companyId };
    if (isExternal !== undefined) where.isExternal = isExternal === 'true';
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.expense.findMany({
      where,
      include: { rubric: true, supplier: true },
      orderBy: { date: 'desc' },
    });
  }

  create(companyId: string, userId: string, data: any) {
    return this.prisma.expense.create({
      data: {
        companyId,
        rubricId:      data.rubricId      || null,
        supplierId:    data.supplierId    || null,
        cashAccountId: data.cashAccountId || null,
        date:          new Date(data.date),
        concept:       data.concept,
        subtotal:      data.subtotal || 0,
        tax:           data.tax      || 0,
        total:         (data.subtotal || 0) + (data.tax || 0),
        currency:      data.currency      || 'MXN',
        paymentMethod: data.paymentMethod || 'efectivo',
        paymentStatus: data.paymentStatus || 'PAGADO',
        invoiceRef:    data.invoiceRef    || null,
userId:       userId,
        totalMxn:     (data.subtotal || 0) + (data.tax || 0),
        exchangeRate: 1,
        isExternal:    data.isExternal    || false,
        externalNotes: data.externalNotes || null,
      },
      include: { rubric: true, supplier: true },
    });
  }

  delete(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
