import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FlowService {
  constructor(private prisma: PrismaService) {}

  async getBalances(companyId: string) {
    const accounts = await this.prisma.cashAccount.findMany({
      where: { companyId, isActive: true },
    });

    const balances = await Promise.all(
      accounts.map(async (acc) => {
        const inflows = await this.prisma.flowMovement.aggregate({
          where: { companyId, cashAccountId: acc.id, type: 'ENTRADA' },
          _sum: { amountMxn: true },
        });
        const outflows = await this.prisma.flowMovement.aggregate({
          where: { companyId, cashAccountId: acc.id, type: 'SALIDA' },
          _sum: { amountMxn: true },
        });
        const balance = Number(inflows._sum.amountMxn || 0) - Number(outflows._sum.amountMxn || 0);
        return {
          accountId:   acc.id,
          accountCode: acc.code,
          accountName: acc.name,
          type:        acc.type,
          currency:    acc.currency,
          bankName:    acc.bankName,
          balance,
        };
      })
    );

    const totalMxn = balances.filter(b => b.currency === 'MXN').reduce((t, b) => t + b.balance, 0);
    const totalUsd = balances.filter(b => b.currency === 'USD').reduce((t, b) => t + b.balance, 0);

    return { accounts: balances, totalMxn, totalUsd };
  }

  async transfer(companyId: string, data: any) {
    const branch = await this.prisma.branch.findFirst({ where: { companyId } });
    return this.prisma.$transaction([
      this.prisma.flowMovement.create({
        data: {
          companyId, branchId: branch!.id,
          cashAccountId: data.fromAccountId,
          date: new Date(data.date),
          type: 'SALIDA', originType: 'TRASPASO', originId: data.toAccountId,
          amount: data.amount, currency: data.currency || 'MXN',
          exchangeRate: 1, amountMxn: data.amount,
          notes: data.notes,
        },
      }),
      this.prisma.flowMovement.create({
        data: {
          companyId, branchId: branch!.id,
          cashAccountId: data.toAccountId,
          date: new Date(data.date),
          type: 'ENTRADA', originType: 'TRASPASO', originId: data.fromAccountId,
          amount: data.amount, currency: data.currency || 'MXN',
          exchangeRate: 1, amountMxn: data.amount,
          notes: data.notes,
        },
      }),
    ]);
  }
}
