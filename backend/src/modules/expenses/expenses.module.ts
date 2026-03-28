// ─── expenses.module.ts ───────────────────────────────────────
import { Module }              from '@nestjs/common';
import { ExpensesService }     from './expenses.service';
import { ExpensesController }  from './expenses.controller';

@Module({
  providers:   [ExpensesService],
  controllers: [ExpensesController],
  exports:     [ExpensesService],
})
export class ExpensesModule {}

// ─── expenses.service.ts ──────────────────────────────────────
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string, filters: {
    period?:     string;
    rubricId?:   string;
    isExternal?: boolean;
    supplierId?: string;
  }) {
    const where: any = { companyId };
    if (filters.rubricId)               where.rubricId   = filters.rubricId;
    if (filters.supplierId)             where.supplierId = filters.supplierId;
    if (filters.isExternal !== undefined) where.isExternal = filters.isExternal;

    if (filters.period) {
      const [y, m] = filters.period.split('-').map(Number);
      where.date = { gte: new Date(y, m-1, 1), lte: new Date(y, m, 0) };
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        supplier:    { select: { id: true, name: true } },
        rubric:      { select: { id: true, code: true, name: true, rubricType: true } },
        cashAccount: { select: { id: true, code: true, name: true } },
        user:        { select: { id: true, name: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(companyId: string, userId: string, data: {
    supplierId?:    string;
    rubricId?:      string;
    cashAccountId?: string;
    date:           string;
    concept:        string;
    description?:   string;
    subtotal:       number;
    tax?:           number;
    currency:       string;
    exchangeRate?:  number;
    paymentStatus:  string;
    paymentMethod?: string;
    invoiceRef?:    string;
    isExternal?:    boolean;
    externalNotes?: string;
  }) {
    const tax        = data.tax        || 0;
    const total      = data.subtotal + tax;
    const exRate     = data.exchangeRate || 1;
    const totalMxn   = total * exRate;
    const isExternal = data.isExternal || false;

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear gasto
      const expense = await tx.expense.create({
        data: {
          companyId,
          supplierId:    data.supplierId    || null,
          rubricId:      data.rubricId      || null,
          cashAccountId: data.cashAccountId || null,
          userId,
          date:          new Date(data.date),
          concept:       data.concept,
          description:   data.description   || null,
          subtotal:      data.subtotal,
          tax,
          total,
          currency:      data.currency,
          exchangeRate:  exRate,
          totalMxn,
          paymentStatus: data.paymentStatus,
          paymentMethod: data.paymentMethod || null,
          invoiceRef:    data.invoiceRef    || null,
          isExternal,
          externalNotes: data.externalNotes || null,
        },
      });

      // 2. Si es pagado y tiene cuenta de flujo: generar salida de flujo
      // Las operaciones externas SÍ afectan el flujo pero NO el ER
      if (data.paymentStatus === 'PAGADO' && data.cashAccountId) {
        const branch = await tx.branch.findFirst({
          where: { company: { id: companyId } },
        });
        await tx.flowMovement.create({
          data: {
            companyId,
            branchId:      branch!.id,
            cashAccountId: data.cashAccountId,
            date:          new Date(data.date),
            type:          'SALIDA',
            originType:    'GASTO',
            originId:      expense.id,
            rubricId:      data.rubricId || null,
            amount:        total,
            currency:      data.currency,
            exchangeRate:  exRate,
            amountMxn:     totalMxn,
          },
        });
      }

      // 3. Si es pendiente: generar CxP
      if (data.paymentStatus === 'PENDIENTE' && data.supplierId) {
        await tx.payable.create({
          data: {
            companyId,
            supplierId:    data.supplierId,
            rubricId:      data.rubricId || null,
            concept:       data.concept,
            date:          new Date(data.date),
            currency:      data.currency,
            originalAmount: total,
            paidAmount:    0,
            balance:       total,
            status:        'PENDIENTE',
          },
        });
      }

      return expense;
    });
  }

  // Resumen por rubro para el concentrado mensual
  async getSummaryByRubric(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const where = {
      companyId,
      isExternal: false,
      date: { gte: new Date(y, m-1, 1), lte: new Date(y, m, 0) },
    };

    const byRubric = await this.prisma.expense.groupBy({
      by:   ['rubricId'],
      where,
      _sum: { total: true },
    });

    const rubrics = await this.prisma.financialRubric.findMany({
      where: { id: { in: byRubric.map(r => r.rubricId!).filter(Boolean) } },
      select: { id: true, code: true, name: true, group: { select: { name: true } } },
    });

    const rubricMap = new Map(rubrics.map(r => [r.id, r]));

    return byRubric.map(r => ({
      rubricId:   r.rubricId,
      rubricCode: rubricMap.get(r.rubricId!)?.code,
      rubricName: rubricMap.get(r.rubricId!)?.name,
      groupName:  rubricMap.get(r.rubricId!)?.group?.name,
      total:      Number(r._sum.total || 0),
    })).sort((a, b) => b.total - a.total);
  }

  // Operaciones externas del período
  async getExternalOps(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    return this.prisma.expense.findMany({
      where: {
        companyId,
        isExternal: true,
        date: { gte: new Date(y, m-1, 1), lte: new Date(y, m, 0) },
      },
      include: { supplier: { select: { id: true, name: true } } },
      orderBy: { date: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.expense.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }
}

// ─── expenses.controller.ts ───────────────────────────────────
import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/expenses')
export class ExpensesController {
  constructor(private svc: ExpensesService) {}

  @Get()
  findAll(
    @Param('companyId')  id:          string,
    @Query('period')     period?:     string,
    @Query('rubricId')   rubricId?:   string,
    @Query('isExternal') isExternal?: string,
  ) {
    return this.svc.findAll(id, {
      period, rubricId,
      isExternal: isExternal !== undefined ? isExternal === 'true' : undefined,
    });
  }

  @Get('summary')
  summary(
    @Param('companyId') id:     string,
    @Query('period')    period: string,
  ) {
    return this.svc.getSummaryByRubric(id, period);
  }

  @Get('external')
  external(
    @Param('companyId') id:     string,
    @Query('period')    period: string,
  ) {
    return this.svc.getExternalOps(id, period);
  }

  @Post()
  create(
    @Param('companyId') id:   string,
    @Body()             body: any,
    @Request()          req:  any,
  ) {
    return this.svc.create(id, req.user.sub, body);
  }

  @Put(':expenseId')
  update(@Param('expenseId') eid: string, @Body() body: any) {
    return this.svc.update(eid, body);
  }

  @Delete(':expenseId')
  delete(@Param('expenseId') eid: string) {
    return this.svc.delete(eid);
  }
}
