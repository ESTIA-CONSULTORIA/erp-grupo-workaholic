// ─── flow.module.ts ───────────────────────────────────────────
import { Module }          from '@nestjs/common';
import { FlowService }     from './flow.service';
import { FlowController }  from './flow.controller';

@Module({
  providers:   [FlowService],
  controllers: [FlowController],
  exports:     [FlowService],
})
export class FlowModule {}

// ─── flow.service.ts ──────────────────────────────────────────
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FlowService {
  constructor(private prisma: PrismaService) {}

  // ── Saldo actual por cuenta ───────────────────────────────
  async getBalances(companyId: string) {
    const accounts = await this.prisma.cashAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { type: 'asc' },
    });

    const balances = await Promise.all(accounts.map(async (acct) => {
      const inflows = await this.prisma.flowMovement.aggregate({
        where: { companyId, cashAccountId: acct.id, type: 'ENTRADA' },
        _sum:  { amountMxn: true },
      });
      const outflows = await this.prisma.flowMovement.aggregate({
        where: { companyId, cashAccountId: acct.id, type: { in: ['SALIDA','TRASPASO_ORIGEN'] } },
        _sum:  { amountMxn: true },
      });

      const balance = Number(inflows._sum.amountMxn  || 0)
                    - Number(outflows._sum.amountMxn || 0);

      return {
        accountId:   acct.id,
        accountCode: acct.code,
        accountName: acct.name,
        type:        acct.type,
        currency:    acct.currency,
        balance,
        bankName:    acct.bankName,
      };
    }));

    const totalMxn = balances
      .filter(b => b.currency === 'MXN')
      .reduce((t, b) => t + b.balance, 0);

    const totalUsd = balances
      .filter(b => b.currency === 'USD')
      .reduce((t, b) => t + b.balance, 0);

    return { accounts: balances, totalMxn, totalUsd };
  }

  // ── Movimientos del período ───────────────────────────────
  async getMovements(companyId: string, filters: {
    cashAccountId?: string;
    period?:        string;
    type?:          string;
  }) {
    const where: any = { companyId };
    if (filters.cashAccountId) where.cashAccountId = filters.cashAccountId;
    if (filters.type)          where.type          = filters.type;

    if (filters.period) {
      const [y, m] = filters.period.split('-').map(Number);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m,     0),
      };
    }

    return this.prisma.flowMovement.findMany({
      where,
      include: {
        cashAccount: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // ── Traspaso entre cuentas (no afecta ER) ────────────────
  async transfer(companyId: string, data: {
    fromAccountId: string;
    toAccountId:   string;
    amount:        number;
    currency:      string;
    exchangeRate?: number;
    date:          string;
    reference?:    string;
    notes?:        string;
  }) {
    const { fromAccountId, toAccountId, amount, currency, date, reference, notes } = data;
    const exchangeRate = data.exchangeRate || 1;
    const amountMxn    = amount * exchangeRate;

    if (fromAccountId === toAccountId)
      throw new BadRequestException('Las cuentas origen y destino deben ser diferentes');

    return this.prisma.$transaction(async (tx) => {
      // Salida de la cuenta origen
      await tx.flowMovement.create({
        data: {
          companyId,
          branchId:      (await tx.branch.findFirst({ where: { company: { id: companyId } } }))!.id,
          cashAccountId: fromAccountId,
          date:          new Date(date),
          type:          'TRASPASO_ORIGEN',
          originType:    'TRASPASO',
          amount, currency, exchangeRate, amountMxn,
          reference, notes,
        },
      });

      // Entrada a la cuenta destino
      await tx.flowMovement.create({
        data: {
          companyId,
          branchId:      (await tx.branch.findFirst({ where: { company: { id: companyId } } }))!.id,
          cashAccountId: toAccountId,
          date:          new Date(date),
          type:          'TRASPASO_DESTINO',
          originType:    'TRASPASO',
          amount, currency, exchangeRate, amountMxn,
          reference, notes,
        },
      });
    });
  }

  // ── Ajuste manual de saldo ────────────────────────────────
  async manualAdjustment(companyId: string, branchId: string, data: {
    cashAccountId: string;
    type:          'ENTRADA' | 'SALIDA';
    amount:        number;
    currency:      string;
    exchangeRate?: number;
    date:          string;
    notes:         string;
  }) {
    const amountMxn = data.amount * (data.exchangeRate || 1);
    return this.prisma.flowMovement.create({
      data: {
        companyId,
        branchId,
        cashAccountId: data.cashAccountId,
        date:          new Date(data.date),
        type:          data.type,
        originType:    'AJUSTE',
        amount:        data.amount,
        currency:      data.currency,
        exchangeRate:  data.exchangeRate || 1,
        amountMxn,
        notes:         data.notes,
      },
    });
  }

  // ── ARQUEO DE CAJA ────────────────────────────────────────
  // Compara saldo teórico (libro) vs físico (conteo)
  async createCashCount(companyId: string, data: {
    branchId:       string;
    cashAccountId:  string;
    date:           string;
    physicalCount:  number;
    countDetail?:   any;
    // { billetes: {1000:3, 500:10...}, monedas: {10:5...}, usd: {100:2...} }
    differenceNotes?: string;
    evidenceUrl?:   string;
  }) {
    const { branchId, cashAccountId, date, physicalCount, countDetail, differenceNotes, evidenceUrl } = data;

    // Calcular saldo teórico
    const balances = await this.getBalances(companyId);
    const account  = balances.accounts.find(a => a.accountId === cashAccountId);
    const theoretical = account?.balance || 0;

    const inflows = await this.prisma.flowMovement.aggregate({
      where: { companyId, cashAccountId, type: 'ENTRADA', date: new Date(date) },
      _sum:  { amountMxn: true },
    });
    const outflows = await this.prisma.flowMovement.aggregate({
      where: { companyId, cashAccountId, type: 'SALIDA', date: new Date(date) },
      _sum:  { amountMxn: true },
    });

    const openingBalance = theoretical
      - Number(inflows._sum.amountMxn  || 0)
      + Number(outflows._sum.amountMxn || 0);

    const difference = physicalCount - theoretical;

    return this.prisma.cashCount.create({
      data: {
        companyId:         '',  // se omite, el campo no está en el modelo original
        branchId,
        cashAccountId,
        date:              new Date(date),
        openingBalance,
        inflows:           Number(inflows._sum.amountMxn  || 0),
        outflows:          Number(outflows._sum.amountMxn || 0),
        theoreticalBalance: theoretical,
        physicalCount,
        difference,
        countDetail,
        differenceNotes,
        evidenceUrl,
        status:            'CERRADO',
      },
    });
  }

  async getCashCounts(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    return this.prisma.cashCount.findMany({
      where: {
        branch:     { companyId },
        date: {
          gte: new Date(y, m - 1, 1),
          lte: new Date(y, m,     0),
        },
      },
      include: {
        cashAccount: { select: { id: true, code: true, name: true, currency: true } },
        branch:      { select: { id: true, name: true, code: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  // ── Ratio 33% — venta vs depósito en banco ────────────────
  async getRatio(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const startDate = new Date(y, m - 1, 1);
    const endDate   = new Date(y, m,     0);

    // Total venta neta aprobada del período
    const sales = await this.prisma.cutLine.aggregate({
      where: {
        cut: { companyId, date: { gte: startDate, lte: endDate }, status: 'APROBADO' },
        paymentType: 'CONTADO',
      },
      _sum: { netAmount: true },
    });

    // Total entradas bancarias (transferencia/tarjeta)
    const bankIn = await this.prisma.flowMovement.aggregate({
      where: {
        companyId,
        date:    { gte: startDate, lte: endDate },
        type:    'ENTRADA',
        cashAccount: { type: { in: ['BANCO', 'PLATAFORMA'] } },
      },
      _sum: { amountMxn: true },
    });

    // Total efectivo
    const cashIn = await this.prisma.flowMovement.aggregate({
      where: {
        companyId,
        date:    { gte: startDate, lte: endDate },
        type:    'ENTRADA',
        cashAccount: { type: 'EFECTIVO' },
      },
      _sum: { amountMxn: true },
    });

    const totalSale  = Number(sales._sum.netAmount  || 0);
    const totalBank  = Number(bankIn._sum.amountMxn || 0);
    const totalCash  = Number(cashIn._sum.amountMxn || 0);
    const ratio      = totalSale > 0 ? totalBank / totalSale : 0;

    return { period, totalSale, totalBank, totalCash, ratio };
  }
}

// ─── flow.controller.ts ───────────────────────────────────────
import {
  Controller, Get, Post, Param,
  Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Flow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/flow')
export class FlowController {
  constructor(private svc: FlowService) {}

  @Get('balances')
  balances(@Param('companyId') id: string) {
    return this.svc.getBalances(id);
  }

  @Get('movements')
  movements(
    @Param('companyId')     id:           string,
    @Query('period')        period?:      string,
    @Query('cashAccountId') accountId?:   string,
    @Query('type')          type?:        string,
  ) {
    return this.svc.getMovements(id, { period, cashAccountId: accountId, type });
  }

  @Get('ratio')
  ratio(
    @Param('companyId') id:     string,
    @Query('period')    period: string,
  ) {
    return this.svc.getRatio(id, period);
  }

  @Get('cash-counts')
  cashCounts(
    @Param('companyId') id:     string,
    @Query('period')    period: string,
  ) {
    return this.svc.getCashCounts(id, period);
  }

  @Post('transfer')
  transfer(@Param('companyId') id: string, @Body() body: any) {
    return this.svc.transfer(id, body);
  }

  @Post('adjustment')
  adjustment(
    @Param('companyId') id:   string,
    @Body()             body: any,
  ) {
    return this.svc.manualAdjustment(id, body.branchId, body);
  }

  @Post('cash-counts')
  createCashCount(
    @Param('companyId') id:   string,
    @Body()             body: any,
  ) {
    return this.svc.createCashCount(id, body);
  }
}
