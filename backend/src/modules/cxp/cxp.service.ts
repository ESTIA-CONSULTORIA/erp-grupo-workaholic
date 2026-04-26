import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CxpService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, period?: string, status?: string, supplierId?: string) {
    const where: any = { companyId };
    if (status)     where.status     = status;
    if (supplierId) where.supplierId = supplierId;
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.payable.findMany({
      where,
      include: { supplier: true, payments: true },
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(companyId: string) {
    const pending = await this.prisma.payable.findMany({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
    });
    const totalPending  = pending.reduce((t, p) => t + Number(p.balance), 0);
    const totalOverdue  = pending
      .filter(p => p.dueDate && new Date(p.dueDate) < new Date())
      .reduce((t, p) => t + Number(p.balance), 0);
    return { totalPending, totalOverdue, pendingCount: pending.length };
  }

  create(companyId: string, data: any) {
    const balance = Number(data.originalAmount);
    return this.prisma.payable.create({
      data: {
        companyId,
        supplierId:     data.supplierId     || null,
        rubricId:       data.rubricId       || null,
        concept:        data.concept,
        date:           new Date(data.date),
        dueDate:        data.dueDate ? new Date(data.dueDate) : null,
        currency:       data.currency       || 'MXN',
        originalAmount: balance,
        paidAmount:     0,
        balance,
        status:         'PENDIENTE',
        notes:          data.notes          || null,
      },
    });
  }

  async addPayment(payableId: string, data: any) {
    const payable = await this.prisma.payable.findUnique({ where: { id: payableId } });
    if (!payable) throw new Error('CxP no encontrada');

    const newBalance = Number(payable.balance) - Number(data.amount);
    const newStatus  = newBalance <= 0 ? 'PAGADO' : 'PARCIAL';

    return this.prisma.$transaction([
      this.prisma.payablePayment.create({
        data: {
          payableId,
          cashAccountId:  data.cashAccountId  || null,
          date:           new Date(data.date),
          amount:         Number(data.amount),
          currency:       data.currency        || 'MXN',
          exchangeRate:   data.exchangeRate    || 1,
          paymentMethod:  data.paymentMethod   || 'EFECTIVO_MXN',
          reference:      data.reference       || null,
          notes:          data.notes           || null,
        },
      }),
      this.prisma.payable.update({
        where: { id: payableId },
        data: {
          paidAmount: Number(payable.paidAmount) + Number(data.amount),
          balance:    newBalance,
          status:     newStatus,
        },
      }),
    ]);
  }

  update(id: string, data: any) {
    return this.prisma.payable.update({
      where: { id },
      data: {
        concept:    data.concept,
        dueDate:    data.dueDate ? new Date(data.dueDate) : undefined,
        notes:      data.notes,
        supplierId: data.supplierId || undefined,
      },
    });
  }
  async cancelPayable(id: string, motivo: string) {
    const cxp = await this.prisma.payable.findUnique({ where: { id } });
    if (!cxp) throw new Error('CxP no encontrada');
    if (cxp.status === 'PAGADO') throw new Error('No se puede cancelar una CxP ya pagada');
    return this.prisma.payable.update({
      where: { id },
      data: { status: 'CANCELADA', notes: motivo ? `CANCELADA: ${motivo}` : 'CANCELADA' },
    });
  }

}