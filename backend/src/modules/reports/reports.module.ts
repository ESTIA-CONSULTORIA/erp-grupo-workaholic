// ─── reports.module.ts ────────────────────────────────────────
import { Module }             from '@nestjs/common';
import { ReportsService }     from './reports.service';
import { ReportsController }  from './reports.controller';

@Module({
  providers:   [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}

// ─── reports.service.ts ───────────────────────────────────────
// Motor de estado de resultados dinámico
// Se construye desde la configuración del esquema financiero
// NO depende de nombres de rubros, solo de sus atributos
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ── ESTADO DE RESULTADOS ─────────────────────────────────────
  async getIncomeStatement(companyId: string, period: string) {
    // period = "2026-03"
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month,     0); // último día del mes

    // 1. Obtener esquema financiero
    const schema = await this.prisma.financialSchema.findUnique({
      where: { companyId },
      include: {
        sections: {
          include: {
            groups: {
              include: {
                rubrics: { where: { isActive: true }, orderBy: { order: 'asc' } },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!schema) return null;

    // 2. Agregar ventas por rubro del período
    const salesByRubric = await this.prisma.cutLine.groupBy({
      by: ['rubricId'],
      where: {
        cut: {
          companyId,
          date:   { gte: startDate, lte: endDate },
          status: 'APROBADO',
        },
      },
      _sum: {
        grossAmount: true,
        discount:    true,
        courtesy:    true,
        netAmount:   true,
      },
    });

    // 3. Agregar gastos por rubro
    const expensesByRubric = await this.prisma.expense.groupBy({
      by: ['rubricId'],
      where: {
        companyId,
        date:       { gte: startDate, lte: endDate },
        isExternal: false,
      },
      _sum: { total: true },
    });

    // 4. Agregar operaciones externas
    const externalOps = await this.prisma.expense.findMany({
      where: {
        companyId,
        date:       { gte: startDate, lte: endDate },
        isExternal: true,
      },
      select: {
        id: true, concept: true, total: true,
        supplier: { select: { name: true } },
      },
    });

    // 5. Mapas para lookup rápido
    const salesMap    = new Map(salesByRubric.map(r => [r.rubricId, r._sum]));
    const expenseMap  = new Map(expensesByRubric.map(r => [r.rubricId ?? 'sin_rubro', Number(r._sum.total || 0)]));

    // 6. Construir ER dinámico por sección → grupo → rubro
    let totalGrossSale  = 0;
    let totalNetSale    = 0;
    let totalCost       = 0;
    let totalExpenses   = 0;
    let totalObligation = 0;
    let totalExternal   = 0;

    const sections = schema.sections.map(section => {
      const groups = section.groups.map(group => {
        const rubrics = group.rubrics.map(rubric => {
          const sale    = salesMap.get(rubric.id);
          const expense = expenseMap.get(rubric.id) || 0;

          const gross    = Number(sale?.grossAmount || 0);
          const discount = Number(sale?.discount    || 0);
          const courtesy = Number(sale?.courtesy    || 0);
          const net      = Number(sale?.netAmount   || 0);
          const cost     = rubric.affectsCost    ? expense : 0;
          const exp      = rubric.affectsExpense ? expense : 0;

          // Acumuladores globales
          if (rubric.affectsGrossSale) totalGrossSale += gross;
          if (rubric.affectsNetSale)   totalNetSale   += net;
          if (rubric.affectsCost)      totalCost      += cost;
          if (rubric.affectsExpense)   totalExpenses  += exp;

          return {
            rubricId:   rubric.id,
            code:       rubric.code,
            name:       rubric.name,
            rubricType: rubric.rubricType,
            // Contado y CxC
            contado:    rubric.allowsContado ? net   : 0,
            cxc:        rubric.allowsCxC     ? gross : 0,
            gross, discount, courtesy, net,
            cost: cost || exp,
            // % sobre venta neta (se calcula en frontend)
          };
        });

        const groupTotal = rubrics.reduce((t, r) => t + (r.net || r.cost), 0);
        return { ...group, rubrics, total: groupTotal };
      });

      const sectionTotal = groups.reduce((t, g) => t + g.total, 0);
      return { ...section, groups, total: sectionTotal };
    });

    // 7. Totales del ER
    const grossProfit  = totalNetSale - totalCost;
    const operatingIncome = grossProfit - totalExpenses;
    const netIncome    = operatingIncome - totalObligation;

    // 8. Flujo inicial y final
    const flowSummary = await this.getFlowSummary(companyId, startDate, endDate);

    // 9. CxC pendiente al cierre
    const cxcBalance = await this.prisma.receivable.aggregate({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
      _sum:  { balance: true },
    });

    // 10. CxP pendiente al cierre
    const cxpBalance = await this.prisma.payable.aggregate({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
      _sum:  { balance: true },
    });

    return {
      companyId,
      period,
      schema: { id: schema.id, name: schema.name },
      sections,
      summary: {
        totalGrossSale,
        totalNetSale,
        totalCost,
        grossProfit,
        grossMargin:    totalNetSale > 0 ? grossProfit / totalNetSale : 0,
        totalExpenses,
        operatingIncome,
        operatingMargin:totalNetSale > 0 ? operatingIncome / totalNetSale : 0,
        totalObligation,
        netIncome,
        netMargin:      totalNetSale > 0 ? netIncome / totalNetSale : 0,
        externalOps:    { items: externalOps, total: totalExternal },
        cxcBalance:     Number(cxcBalance._sum.balance || 0),
        cxpBalance:     Number(cxpBalance._sum.balance || 0),
      },
      flow: flowSummary,
    };
  }

  // ── FLUJO INICIAL / FINAL ─────────────────────────────────────
  async getFlowSummary(companyId: string, startDate: Date, endDate: Date) {
    const accounts = await this.prisma.cashAccount.findMany({
      where: { companyId, isActive: true },
    });

    const summary: any[] = [];
    for (const acct of accounts) {
      // Movimientos del período
      const movs = await this.prisma.flowMovement.aggregate({
        where: {
          companyId,
          cashAccountId: acct.id,
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amountMxn: true },
      });

      const inflows = await this.prisma.flowMovement.aggregate({
        where: { companyId, cashAccountId: acct.id, type: 'ENTRADA', date: { gte: startDate, lte: endDate } },
        _sum: { amountMxn: true },
      });
      const outflows = await this.prisma.flowMovement.aggregate({
        where: { companyId, cashAccountId: acct.id, type: 'SALIDA', date: { gte: startDate, lte: endDate } },
        _sum: { amountMxn: true },
      });

      summary.push({
        accountId:   acct.id,
        accountCode: acct.code,
        accountName: acct.name,
        currency:    acct.currency,
        type:        acct.type,
        inflows:     Number(inflows._sum.amountMxn  || 0),
        outflows:    Number(outflows._sum.amountMxn || 0),
      });
    }
    return summary;
  }

  // ── RESUMEN DIARIO (concentrado) ──────────────────────────────
  async getDailySummary(companyId: string, date: string) {
    const d = new Date(date);
    const cuts = await this.prisma.cut.findMany({
      where: { companyId, date: d, status: 'APROBADO' },
      include: {
        lines: {
          include: { rubric: true },
        },
        branch: true,
      },
    });

    // Agrupar por rubro
    const byRubric: Record<string, any> = {};
    for (const cut of cuts) {
      for (const line of cut.lines) {
        const key = line.rubricId;
        if (!byRubric[key]) {
          byRubric[key] = {
            rubricId: key,
            rubricCode: line.rubric.code,
            rubricName: line.rubric.name,
            contado: 0, cxc: 0, gross: 0, net: 0,
          };
        }
        byRubric[key].gross   += Number(line.grossAmount);
        byRubric[key].net     += Number(line.netAmount);
        if (line.paymentType === 'CONTADO') byRubric[key].contado += Number(line.netAmount);
        if (line.paymentType === 'CXC')     byRubric[key].cxc     += Number(line.netAmount);
      }
    }

    const totalNet = Object.values(byRubric).reduce((t: number, r: any) => t + r.net, 0);
    return { date, companyId, cuts: cuts.length, byRubric: Object.values(byRubric), totalNet };
  }

  // ── DASHBOARD CONSOLIDADO ─────────────────────────────────────
  async getConsolidatedDashboard(userId: string, period: string) {
    const [year, month] = period.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month,     0);

    // Empresas accesibles por el usuario
    const userCompanies = await this.prisma.userCompanyRole.findMany({
      where: { userId },
      include: { company: true },
    });

    const results = await Promise.all(
      userCompanies.map(async uc => {
        const companyId = uc.companyId;

        const salesAgg = await this.prisma.cutLine.aggregate({
          where: {
            cut: { companyId, date: { gte: startDate, lte: endDate }, status: 'APROBADO' },
            rubric: { affectsNetSale: true },
          },
          _sum: { netAmount: true },
        });

        const expenseAgg = await this.prisma.expense.aggregate({
          where: { companyId, date: { gte: startDate, lte: endDate }, isExternal: false },
          _sum: { total: true },
        });

        const cxcAgg = await this.prisma.receivable.aggregate({
          where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
          _sum: { balance: true },
        });

        return {
          companyId,
          companyCode: uc.company.code,
          companyName: uc.company.name,
          color:       uc.company.color,
          period,
          netSale:     Number(salesAgg._sum.netAmount || 0),
          expenses:    Number(expenseAgg._sum.total   || 0),
          cxcBalance:  Number(cxcAgg._sum.balance     || 0),
          netIncome:   Number(salesAgg._sum.netAmount || 0) - Number(expenseAgg._sum.total || 0),
        };
      })
    );

    const groupTotal = {
      netSale:    results.reduce((t, r) => t + r.netSale,  0),
      expenses:   results.reduce((t, r) => t + r.expenses, 0),
      cxcBalance: results.reduce((t, r) => t + r.cxcBalance, 0),
      netIncome:  results.reduce((t, r) => t + r.netIncome, 0),
    };

    return { period, companies: results, groupTotal };
  }
}

// ─── reports.controller.ts ────────────────────────────────────
import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard }       from '../auth/auth.guards';
import { CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private svc: ReportsService) {}

  // Estado de resultados dinámico
  @UseGuards(CompanyAccessGuard)
  @Get('companies/:companyId/income-statement')
  incomeStatement(
    @Param('companyId') companyId: string,
    @Query('period')    period:    string,
  ) {
    return this.svc.getIncomeStatement(companyId, period);
  }

  // Resumen diario
  @UseGuards(CompanyAccessGuard)
  @Get('companies/:companyId/daily')
  daily(
    @Param('companyId') companyId: string,
    @Query('date')      date:      string,
  ) {
    return this.svc.getDailySummary(companyId, date);
  }

  // Dashboard consolidado — solo KPIs, sin mezclar transacciones
  @Get('consolidated')
  consolidated(@Request() req: any, @Query('period') period: string) {
    return this.svc.getConsolidatedDashboard(req.user.sub, period);
  }
}
