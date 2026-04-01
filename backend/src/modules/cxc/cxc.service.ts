import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CxcService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, period?: string, status?: string, clientId?: string) {
    const where: any = { companyId };
    if (status)   where.status   = status;
    if (clientId) where.clientId = clientId;
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.receivable.findMany({
      where,
      include: { client: true, payments: true },
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(companyId: string) {
    const pending = await this.prisma.receivable.findMany({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
    });
    const totalPending = pending.reduce((t, c) => t + Number(c.balance), 0);
    const totalOverdue = pending.filter(c => c.status === 'VENCIDO')
      .reduce((t, c) => t + Number(c.balance), 0);
    return { totalPending, totalOverdue, pendingCount: pending.length };
  }

  async addPayment(receivableId: string, cashAccountId: string, data: any) {
    const rec = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!rec) throw new Error('CxC no encontrada');

    const newBalance = Number(rec.balance) - Number(data.amount);
    const newStatus  = newBalance <= 0 ? 'PAGADO' : 'PARCIAL';

    return this.prisma.$transaction([
      this.prisma.receivablePayment.create({
        data: {
          receivableId,
          amount:        data.amount,
          currency:      data.currency      || 'MXN',
          paymentMethod: data.paymentMethod || 'EFECTIVO_MXN',
          date:          new Date(data.date),
          reference:     data.reference     || null,
          cashAccountId: cashAccountId      || null,
        },
      }),
      this.prisma.receivable.update({
        where: { id: receivableId },
        data: {
          paidAmount: Number(rec.paidAmount) + Number(data.amount),
          balance:    newBalance,
          status:     newStatus,
        },
      }),
    ]);
  }
}
