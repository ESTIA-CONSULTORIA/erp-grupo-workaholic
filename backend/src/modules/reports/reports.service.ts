import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getIncomeStatement(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 0, 23, 59, 59);

    // 1. Ventas del POS
    const sales = await this.prisma.sale.findMany({
      where: { companyId, date: { gte: start, lte: end } },
    });
    const ventaBruta    = sales.reduce((t, s) => t + Number(s.total), 0);
    const descuentos    = sales.reduce((t, s) => t + Number((s as any).discount || 0), 0);
    const ventaNeta     = ventaBruta - descuentos;

    // 2. Cortes aprobados
    const cuts = await this.prisma.cut.findMany({
      where: {
        companyId,
        status: 'APROBADO',
        date: { gte: start, lte: end },
      },
      include: { lines: true },
    });
    
    const ventaCortes = cuts.reduce((t, c) => {
      return t + c.lines.reduce((tt, l) => tt + Number(l.netAmount || 0), 0);
    }, 0);

    // 3. Gastos del período por sección/grupo/rubro
    const expenses = await this.prisma.expense.findMany({
      where: { companyId, date: { gte: start, lte: end } },
      include: { rubric: { include: { group: { include: { section: true } } } } },
    });

    // Agrupar gastos por sección → grupo → rubro
    const gastosPorSeccion: Record<string, any> = {};
    let totalGastos = 0;
    let totalContribuciones = 0;

    for (const exp of expenses) {
      const rubric  = exp.rubric;
      const group   = rubric?.group;
      const section = group?.section;
      const secCode = section?.code || 'GASTOS_GENERALES';
      const secName = section?.name || 'Gastos Generales';
      const grpName = group?.name   || 'Otros';
      const rubName = rubric?.name  || 'Sin clasificar';
      const amount  = Number(exp.total);

      if (!gastosPorSeccion[secCode]) {
        gastosPorSeccion[secCode] = { name: secName, grupos: {}, total: 0 };
      }
      if (!gastosPorSeccion[secCode].grupos[grpName]) {
        gastosPorSeccion[secCode].grupos[grpName] = { rubrics: {}, total: 0 };
      }
      if (!gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName]) {
        gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName] = 0;
      }
      gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName] += amount;
      gastosPorSeccion[secCode].grupos[grpName].total             += amount;
      gastosPorSeccion[secCode].total                             += amount;

      if (secCode === 'CONTRIBUCIONES') {
        totalContribuciones += amount;
      } else {
        totalGastos += amount;
      }
    }

    // 4. Nómina del período
    const payrollPeriods = await this.prisma.payrollPeriod.findMany({
      where: { companyId, period, status: 'PAGADO' },
    });
    const totalNomina = payrollPeriods.reduce((t, p) => t + Number(p.totalGross || 0), 0);

    // 5. Cálculos finales
    const totalVentas             = ventaNeta + ventaCortes;
    const resultadoAntesContrib   = totalVentas - totalGastos - totalNomina;
    const resultadoEjercicio      = resultadoAntesContrib - totalContribuciones;

    return {
      period,
      ventas: {
        bruta:       ventaBruta,
        descuentos,
        neta:        ventaNeta,
        cortes:      ventaCortes,
        total:       totalVentas,
      },
      gastosPorSeccion,
      nomina:               totalNomina,
      totalGastos:          totalGastos + totalNomina,
      contribuciones:       totalContribuciones,
      resultadoAntesContrib,
      resultadoEjercicio,
    };
  }

  async getConsolidado(period: string) {
    const companies = await this.prisma.company.findMany({ where: { isActive: true } });
    const results = await Promise.all(
      companies.map(async c => ({
        company: { id: c.id, name: c.name, code: c.code, color: c.color },
        er: await this.getIncomeStatement(c.id, period),
      }))
    );
    return results;
  }
}
