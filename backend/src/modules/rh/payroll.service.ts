import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  getPeriods(companyId: string) {
    return this.prisma.payrollPeriod.findMany({
      where: { companyId },
      orderBy: { period: 'desc' },
    });
  }

  createPeriod(companyId: string, data: any) {
    return this.prisma.payrollPeriod.create({
      data: { companyId, ...data, status: 'ABIERTO' },
    });
  }

  async loadEmployees(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new Error('Período no encontrado');

    const employees = await this.prisma.employee.findMany({
      where: { companyId: period.companyId, status: 'ACTIVO' },
    });

    let loaded = 0;
    for (const emp of employees) {
      const existing = await this.prisma.payrollLine.findUnique({
        where: { payrollPeriodId_employeeId: { payrollPeriodId: periodId, employeeId: emp.id } },
      });
      if (existing) continue;

      const baseSalary = period.type === 'QUINCENAL'
        ? Number(emp.grossSalary) / 2
        : Number(emp.grossSalary);

      const imssEmployee = baseSalary * 0.0204;
      const isrRetention = baseSalary * 0.08;
      const totalPerceptions = baseSalary;
      const totalDeductions  = imssEmployee + isrRetention;
      const netPay = totalPerceptions - totalDeductions;

      await this.prisma.payrollLine.create({
        data: {
          payrollPeriodId: periodId,
          employeeId: emp.id,
          companyId: period.companyId,
          baseSalary, totalPerceptions,
          imssEmployee, isrRetention,
          totalDeductions, netPay,
          imssEmployer: baseSalary * 0.0704,
        },
      });
      loaded++;
    }
    return { loaded, total: employees.length };
  }

  getLines(periodId: string) {
    return this.prisma.payrollLine.findMany({
      where: { payrollPeriodId: periodId },
      include: { employee: { select: { id: true, firstName: true, lastName: true, position: true, employeeNumber: true, bankAccount: true } } },
      orderBy: { employee: { lastName: 'asc' } },
    });
  }

  async updateLine(lineId: string, data: any) {
    const line = await this.prisma.payrollLine.findUnique({ where: { id: lineId } });
    if (!line) throw new Error('Línea no encontrada');

    const overtime    = data.overtime    ?? Number(line.overtime    || 0);
    const bonus       = data.bonus       ?? Number(line.bonus       || 0);
    const infonavit   = data.infonavit   ?? Number(line.infonavit   || 0);
    const loans       = data.loans       ?? Number(line.loans       || 0);

    const totalPerceptions = Number(line.baseSalary) + overtime + bonus;
    const isrRetention     = totalPerceptions * 0.08;
    const totalDeductions  = Number(line.imssEmployee) + isrRetention + infonavit + loans;
    const netPay           = totalPerceptions - totalDeductions;

    return this.prisma.payrollLine.update({
      where: { id: lineId },
      data: { overtime, bonus, infonavit, loans, totalPerceptions, isrRetention, totalDeductions, netPay },
    });
  }

  async exportToContpaq(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { lines: { include: { employee: true } } },
    });
    if (!period) throw new Error('Período no encontrado');

    const rows = ['RFC,Nombre,NumEmpleado,Concepto,TipoConcepto,Importe'];
    for (const line of period.lines) {
      const emp  = line.employee;
      const name = `${emp.lastName} ${emp.firstName}`.trim();
      const rfc  = emp.rfc || '';
      const num  = emp.employeeNumber || '';
      if (Number(line.baseSalary) > 0) rows.push(`${rfc},${name},${num},001,P,${Number(line.baseSalary).toFixed(2)}`);
      if (Number(line.isrRetention) > 0) rows.push(`${rfc},${name},${num},080,D,${Number(line.isrRetention).toFixed(2)}`);
      if (Number(line.imssEmployee) > 0) rows.push(`${rfc},${name},${num},082,D,${Number(line.imssEmployee).toFixed(2)}`);
    }

    const totalNet = period.lines.reduce((t, l) => t + Number(l.netPay), 0);
    await this.prisma.payrollPeriod.update({ where: { id: periodId }, data: { status: 'EXPORTADO', exportedAt: new Date(), totalNet } });

    return {
      csv: rows.join('\n'),
      fileName: `nomina_${period.periodLabel}.csv`,
      recordCount: period.lines.length,
      totalNet,
    };
  }

  async registerPayment(periodId: string, cashAccountId: string, userId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { lines: true },
    });
    if (!period) throw new Error('Período no encontrado');

    const totalNet = period.lines.reduce((t, l) => t + Number(l.netPay), 0);
    const branch   = await this.prisma.branch.findFirst({ where: { company: { id: period.companyId } } });

    const flow = await this.prisma.flowMovement.create({
      data: {
        companyId: period.companyId,
        branchId:  branch!.id,
        cashAccountId,
        date:      new Date(),
        type:      'SALIDA',
        originType:'GASTO',
        originId:  periodId,
        amount:    totalNet,
        currency:  'MXN',
        exchangeRate: 1,
        amountMxn: totalNet,
        notes:     `Pago nómina: ${period.periodLabel}`,
      },
    });

    await this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data: { status: 'PAGADO', paidAt: new Date(), paidById: userId, flowMovementId: flow.id },
    });

    return { flowMovementId: flow.id, totalNet, periodLabel: period.periodLabel };
  }
}
