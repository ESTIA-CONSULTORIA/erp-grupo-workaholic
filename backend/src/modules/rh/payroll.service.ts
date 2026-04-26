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
  // ── CALCULAR (recalcular todas las líneas del período) ────────
  async calculatePeriod(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where:{id:periodId} });
    const divisor = period?.type === 'MENSUAL' ? 1 : 2;

    const lines = await this.prisma.payrollLine.findMany({
      where: { payrollPeriodId: periodId },
      include: { employee: true },
    });

    for (const line of lines) {
      const emp        = line.employee as any;
      const grossTotal = Number(emp.grossSalary || 0) / divisor;

      // ── Calcular split timbrado/efectivo ──────────────────
      let baseTimbrado = grossTotal;
      let baseEfectivo = 0;

      const splitMode = emp.splitMode || 'TOTAL_TIMBRADO';
      if (splitMode === 'MIXTO') {
        if (emp.montoFijoTimbrado) {
          baseTimbrado = Math.min(Number(emp.montoFijoTimbrado), grossTotal);
        } else if (emp.pctTimbrado) {
          baseTimbrado = grossTotal * (Number(emp.pctTimbrado) / 100);
        }
        baseEfectivo = Math.max(0, grossTotal - baseTimbrado);
      } else if (splitMode === 'TOTAL_EFECTIVO') {
        baseTimbrado = 0;
        baseEfectivo = grossTotal;
      }

      // ── IMSS e ISR solo sobre parte timbrada ─────────────
      const imssEmployee = baseTimbrado * 0.0204;
      const isrRetention = baseTimbrado * 0.08;
      const totalDed     = imssEmployee + isrRetention +
                           Number(line.infonavit || 0) + Number(line.loans || 0);

      const totalPerc = grossTotal + Number(line.overtime || 0) + Number(line.bonus || 0);
      const netPay    = totalPerc - totalDed;

      // Net split: efectivo no tiene deducciones (son sobre la parte timbrada)
      const netTimbrado = Math.max(0, baseTimbrado - imssEmployee - isrRetention -
                          Number(line.infonavit || 0) - Number(line.loans || 0));
      const netEfectivo = baseEfectivo; // sin deducciones

      await this.prisma.payrollLine.update({
        where: { id: line.id },
        data: {
          baseSalary:      grossTotal,
          baseTimbrado,
          baseEfectivo,
          totalPerceptions: totalPerc,
          imssEmployee,
          imssEmployer:    baseTimbrado * 0.0704,
          isrRetention,
          totalDeductions: totalDed,
          netPay:          Math.max(0, netPay),
          netTimbrado,
          netEfectivo,
        } as any,
      });
    }

    return { calculated: lines.length };
  }

  // ── CERRAR PERÍODO ────────────────────────────────────────────
  async closePeriod(periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new Error('Período no encontrado');
    if (period.status === 'CERRADO') throw new Error('El período ya está cerrado');

    return this.prisma.payrollPeriod.update({
      where: { id: periodId },
      data:  { status: 'CERRADO' },
    });
  }

  // ── PUBLICAR RECIBOS ──────────────────────────────────────────
  async publishReceipts(periodId: string, publishedById: string) {
    const lines = await this.prisma.payrollLine.findMany({
      where: { payrollPeriodId: periodId },
      include: { employee: true },
    });

    let published = 0;
    for (const line of lines) {
      try {
        const existing = await (this.prisma as any).payrollReceipt.findFirst({
          where: { payrollPeriodId: periodId, employeeId: line.employeeId },
        });
        if (existing) continue;
      } catch { /* table may not exist yet */ }

      try {
        await (this.prisma as any).payrollReceipt.create({
        data: {
          companyId:       line.employee.companyId,
          payrollPeriodId: periodId,
          employeeId:      line.employeeId,
          // EMPLEADO SOLO VE LA PARTE TIMBRADA
          grossAmount:     Number((line as any).baseTimbrado || line.baseSalary || 0),
          deductions:      Number(line.totalDeductions || 0),
          netAmount:       Number((line as any).netTimbrado || line.netPay || 0),
          breakdown:       JSON.stringify({
            // Visible al empleado
            imssEmployee: Number(line.imssEmployee),
            isrRetention: Number(line.isrRetention),
            infonavit:    Number(line.infonavit),
            loans:        Number(line.loans),
            overtime:     Number(line.overtime),
            bonus:        Number(line.bonus),
            // Solo contador/admin (se oculta en el recibo del empleado)
            _split: {
              baseTimbrado: Number((line as any).baseTimbrado || 0),
              baseEfectivo: Number((line as any).baseEfectivo || 0),
              netEfectivo:  Number((line as any).netEfectivo  || 0),
            },
          }),
          publishedAt:    new Date(),
          generatedById:  publishedById,
          status:         'PUBLICADO',
        },
        });
        published++;
      } catch { /* receipt creation failed - table may need migration */ }
    }

    // Receipts published - no notification (userId link not always set)

    return { published };
  }

}