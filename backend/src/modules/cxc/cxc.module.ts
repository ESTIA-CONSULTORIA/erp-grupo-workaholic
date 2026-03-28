// ─── cxc.module.ts ────────────────────────────────────────────
import { Module }        from '@nestjs/common';
import { CxcService }    from './cxc.service';
import { CxcController } from './cxc.controller';

@Module({
  providers:   [CxcService],
  controllers: [CxcController],
  exports:     [CxcService],
})
export class CxcModule {}

// ─── cxc.service.ts ───────────────────────────────────────────
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CxcService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, filters: {
    clientId?: string;
    status?:   string;
    period?:   string;
  }) {
    const where: any = { companyId };
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.status)   where.status   = filters.status;
    if (filters.period) {
      const [y, m] = filters.period.split('-').map(Number);
      where.date = { gte: new Date(y, m-1, 1), lte: new Date(y, m, 0) };
    }

    return this.prisma.receivable.findMany({
      where,
      include: {
        client:   { select: { id: true, name: true, phone: true } },
        payments: { orderBy: { date: 'asc' } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });
  }

  // Resumen de cartera: total pendiente, vencido, por cliente
  async getSummary(companyId: string) {
    const all = await this.prisma.receivable.findMany({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
      include: { client: { select: { id: true, name: true } } },
    });

    const today = new Date();
    let totalPending  = 0;
    let totalOverdue  = 0;
    const byClient: Record<string, any> = {};

    for (const r of all) {
      const balance = Number(r.balance);
      totalPending += balance;
      if (r.dueDate && r.dueDate < today) totalOverdue += balance;

      const cId = r.clientId;
      if (!byClient[cId]) byClient[cId] = { client: r.client, balance: 0, count: 0 };
      byClient[cId].balance += balance;
      byClient[cId].count++;
    }

    return {
      totalPending,
      totalOverdue,
      pendingCount: all.length,
      byClient: Object.values(byClient).sort((a: any, b: any) => b.balance - a.balance),
    };
  }

  // Registrar abono
  // REGLA CRÍTICA: el abono NO genera nuevo ingreso en el ER,
  // solo reduce el saldo de la CxC y genera movimiento de flujo
  async registerPayment(receivableId: string, data: {
    cashAccountId?: string;
    date:           string;
    amount:         number;
    currency:       string;
    exchangeRate?:  number;
    paymentMethod:  string;
    reference?:     string;
    notes?:         string;
  }) {
    const receivable = await this.prisma.receivable.findUnique({
      where: { id: receivableId },
    });
    if (!receivable) throw new NotFoundException('CxC no encontrada');
    if (receivable.status === 'PAGADO')
      throw new BadRequestException('Esta CxC ya está liquidada');

    const balance = Number(receivable.balance);
    if (data.amount > balance + 0.01)
      throw new BadRequestException(
        `El abono ($${data.amount}) supera el saldo ($${balance})`
      );

    const newPaid    = Number(receivable.paidAmount) + data.amount;
    const newBalance = balance - data.amount;
    const newStatus  = newBalance <= 0.01 ? 'PAGADO'
                     : newPaid   > 0      ? 'PARCIAL'
                     : 'PENDIENTE';

    return this.prisma.$transaction(async (tx) => {
      // 1. Actualizar CxC
      await tx.receivable.update({
        where: { id: receivableId },
        data: {
          paidAmount: newPaid,
          balance:    newBalance,
          status:     newStatus,
        },
      });

      // 2. Registrar pago
      const payment = await tx.receivablePayment.create({
        data: {
          receivableId,
          cashAccountId: data.cashAccountId || null,
          date:          new Date(data.date),
          amount:        data.amount,
          currency:      data.currency,
          exchangeRate:  data.exchangeRate || 1,
          paymentMethod: data.paymentMethod,
          reference:     data.reference || null,
          notes:         data.notes     || null,
        },
      });

      // 3. Generar movimiento de flujo por el abono
      if (data.cashAccountId) {
        const amountMxn = data.amount * (data.exchangeRate || 1);
        await tx.flowMovement.create({
          data: {
            companyId:     receivable.companyId,
            branchId:      (await tx.branch.findFirst({
              where: { company: { id: receivable.companyId } }
            }))!.id,
            cashAccountId: data.cashAccountId,
            date:          new Date(data.date),
            type:          'ENTRADA',
            originType:    'ABONO_CXC',
            originId:      receivableId,
            rubricId:      receivable.rubricId || null,
            amount:        data.amount,
            currency:      data.currency,
            exchangeRate:  data.exchangeRate || 1,
            amountMxn,
            reference:     data.reference || null,
          },
        });
      }

      return payment;
    });
  }
}

// ─── cxc.controller.ts ────────────────────────────────────────
import {
  Controller, Get, Post, Param,
  Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('CxC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/cxc')
export class CxcController {
  constructor(private svc: CxcService) {}

  @Get()
  findAll(
    @Param('companyId') id:        string,
    @Query('clientId')  clientId?: string,
    @Query('status')    status?:   string,
    @Query('period')    period?:   string,
  ) {
    return this.svc.findAll(id, { clientId, status, period });
  }

  @Get('summary')
  summary(@Param('companyId') id: string) {
    return this.svc.getSummary(id);
  }

  @Post(':receivableId/payments')
  payment(
    @Param('receivableId') rid:  string,
    @Body()                body: any,
  ) {
    return this.svc.registerPayment(rid, body);
  }
}
