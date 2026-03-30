import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CxcService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, period?: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.cxC.findMany({
      where,
      include: { client: true, payments: true },
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(companyId: string) {
    const pending = await this.prisma.cxC.findMany({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
    });
    const totalPending = pending.reduce((t, c) => t + Number(c.balance), 0);
    const totalOverdue = pending.filter(c => c.status === 'VENCIDO')
      .reduce((t, c) => t + Number(c.balance), 0);
    return { totalPending, totalOverdue, pendingCount: pending.length };
  }

  async addPayment(cxcId: string, cashAccountId: string, data: any) {
    const cxc = await this.prisma.cxC.findUnique({ where: { id: cxcId } });
    if (!cxc) throw new Error('CxC no encontrada');

    const newBalance = Number(cxc.balance) - Number(data.amount);
    const newStatus = newBalance <= 0 ? 'PAGADO' : 'PARCIAL';

    return this.prisma.$transaction([
      this.prisma.cxCPayment.create({
        data: {
          cxcId,
          amount:        data.amount,
          currency:      data.currency      || 'MXN',
          paymentMethod: data.paymentMethod || 'EFECTIVO_MXN',
          date:          new Date(data.date),
          reference:     data.reference     || null,
          cashAccountId,
        },
      }),
      this.prisma.cxC.update({
        where: { id: cxcId },
        data: {
          paidAmount: Number(cxc.paidAmount) + Number(data.amount),
          balance:    newBalance,
          status:     newStatus,
        },
      }),
    ]);
  }
}
