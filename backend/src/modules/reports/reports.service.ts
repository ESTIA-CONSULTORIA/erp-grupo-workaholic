import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getIncomeStatement(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 0);

    const cuts = await this.prisma.cut.findMany({
      where: { companyId, status: 'APROBADO', date: { gte: start, lte: end } },
      include: { lines: { include: { rubric: true } } },
    });

    const expenses = await this.prisma.expense.findMany({
      where: { companyId, isExternal: false, date: { gte: start, lte: end } },
      include: { rubric: true },
    });

    let totalNetSale = 0;
    let totalExpenses = 0;

    cuts.forEach(cut => {
      cut.lines.forEach(line => { totalNetSale += Number(line.netAmount || 0); });
    });

    expenses.forEach(exp => { totalExpenses += Number(exp.total || 0); });

    const netIncome = totalNetSale - totalExpenses;

    return {
      summary: {
        totalNetSale,
        totalCost: 0,
        totalExpenses,
        grossProfit: totalNetSale,
        grossMargin: totalNetSale > 0 ? 1 : 0,
        operatingIncome: netIncome,
        netIncome,
        netMargin: totalNetSale > 0 ? netIncome / totalNetSale : 0,
      },
      sections: [],
    };
  }

  async getConsolidated(period: string) {
    const companies = await this.prisma.company.findMany({ where: { isActive: true } });
    const results = await Promise.all(
      companies.map(async (c) => {
        const data = await this.getIncomeStatement(c.id, period);
        return {
          companyId:   c.id,
          companyName: c.name,
          color:       c.color,
          netSale:     data.summary.totalNetSale,
          expenses:    data.summary.totalExpenses,
          netIncome:   data.summary.netIncome,
          cxcBalance:  0,
        };
      })
    );

    const groupTotal = {
      netSale:    results.reduce((t, c) => t + c.netSale,   0),
      expenses:   results.reduce((t, c) => t + c.expenses,  0),
      netIncome:  results.reduce((t, c) => t + c.netIncome, 0),
      cxcBalance: 0,
    };

    return { companies: results, groupTotal };
  }
}
