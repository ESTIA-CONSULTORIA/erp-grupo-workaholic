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

  async create(companyId: string, userId: string, data: any) {
    const subtotal = Number(data.subtotal || 0);
    const tax      = Number(data.tax      || 0);
    const total    = subtotal + tax;

    const expense = await this.prisma.expense.create({
      data: {
        companyId,
        rubricId:      data.rubricId      || null,
        supplierId:    data.supplierId    || null,
        cashAccountId: data.cashAccountId || null,
        userId,
        date:          new Date(data.date),
        concept:       data.concept,
        subtotal,
        tax,
        total,
        currency:      data.currency      || 'MXN',
        exchangeRate:  1,
        totalMxn:      total,
        paymentMethod: data.paymentMethod || 'EFECTIVO',
        paymentStatus: data.paymentStatus || 'PAGADO',
        invoiceRef:    data.invoiceRef    || null,
        isExternal:    data.isExternal    || false,
        externalNotes: data.externalNotes || null,
      },
      include: { rubric: true, supplier: true },
    });

    // Registrar salida en flujo de efectivo si es pago inmediato
    if ((data.paymentStatus || 'PAGADO') === 'PAGADO' && data.paymentMethod !== 'CREDITO_CLIENTE' && data.paymentMethod !== 'credito') {
      try {
        const branch = await this.prisma.branch.findFirst({ where: { companyId } });

        // Determinar cuenta según método de pago
        let cashAccountId = data.cashAccountId;
        if (!cashAccountId) {
          const metodo = data.paymentMethod || 'EFECTIVO';
          const esEfectivo = metodo.includes('EFECTIVO');
          const cuenta = await this.prisma.cashAccount.findFirst({
            where: {
              companyId,
              isActive: true,
              type: esEfectivo ? 'EFECTIVO' : { in: ['BANCO', 'PLATAFORMA'] },
            },
          });
          cashAccountId = cuenta?.id;
        }

        if (branch && cashAccountId) {
          await this.prisma.flowMovement.create({
            data: {
              companyId,
              branchId:      branch.id,
              cashAccountId,
              date:          new Date(data.date),
              type:          'SALIDA',
              originType:    'GASTO',
              originId:      expense.id,
              amount:        total,
              currency:      data.currency || 'MXN',
              exchangeRate:  1,
              amountMxn:     total,
              notes:         data.concept,
            },
          });
        }
      } catch (e: any) {
        console.error('ERROR FLOW GASTO:', e.message);
      }
    }

    return expense;
  }

  delete(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}
