import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CxcService {
  constructor(private prisma: PrismaService) {}

  findAll(companyId: string, period?: string, status?: string, clientId?: string, startDate?: string, endDate?: string) {
    const where: any = { companyId };
    if (status)   where.status   = status;
    if (clientId) where.clientId = clientId;
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    } else if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
    }
    return this.prisma.receivable.findMany({
      where,
      include: {
        client:   true,
        payments: { orderBy: { date: 'desc' } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getSummary(companyId: string, clientId?: string) {
    const where: any = { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } };
    if (clientId) where.clientId = clientId;
    const pending = await this.prisma.receivable.findMany({ where });
    const totalPending = pending.reduce((t, c) => t + Number(c.balance), 0);
    const totalOverdue = pending
      .filter(c => c.dueDate && new Date(c.dueDate) < new Date())
      .reduce((t, c) => t + Number(c.balance), 0);
    return { totalPending, totalOverdue, pendingCount: pending.length };
  }

  async addPayment(receivableId: string, cashAccountId: string, data: any) {
    const rec = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
    if (!rec) throw new Error('CxC no encontrada');
    const newBalance = Number(rec.balance) - Number(data.amount);
    const newStatus  = newBalance <= 0 ? 'PAGADO' : 'PARCIAL';

    // Fix UTC: usar mediodía para evitar desfase de zona horaria
    const fecha = new Date(data.date + 'T12:00:00');

    return this.prisma.$transaction([
      this.prisma.receivablePayment.create({
        data: {
          receivableId,
          amount:        data.amount,
          currency:      data.currency      || 'MXN',
          paymentMethod: data.paymentMethod || 'EFECTIVO_MXN',
          date:          fecha,
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
  async cancelReceivable(id: string, motivo: string) {
    const cxc = await this.prisma.receivable.findUnique({ where: { id } });
    if (!cxc) throw new Error('CxC no encontrada');
    if (cxc.status === 'PAGADA' || cxc.status === 'COBRADA') throw new Error('No se puede cancelar una CxC ya pagada');
    return this.prisma.receivable.update({
      where: { id },
      data: { status: 'CANCELADA', notes: motivo ? `CANCELADA: ${motivo}` : 'CANCELADA' },
    });
  }

}