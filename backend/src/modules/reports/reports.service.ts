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
    const ventaBruta  = sales.reduce((t, s) => t + Number(s.total), 0);
    const descuentos  = sales.reduce((t, s) => t + Number((s as any).discount || 0), 0);
    const ventaNeta   = ventaBruta - descuentos;

    // 2. Cortes aprobados
    const cuts = await this.prisma.cut.findMany({
      where: { companyId, status: 'APROBADO', date: { gte: start, lte: end } },
      include: { lines: true },
    });
    const ventaCortes = cuts.reduce((t, c) =>
      t + c.lines.reduce((tt, l) => tt + Number(l.netAmount || 0), 0), 0);

    // 3. Gastos por sección/grupo/rubro
    const expenses = await this.prisma.expense.findMany({
      where: { companyId, date: { gte: start, lte: end } },
      include: { rubric: { include: { group: { include: { section: true } } } } },
    });

    const gastosPorSeccion: Record<string, any> = {};
    let totalGastos = 0, totalContribuciones = 0;

    for (const exp of expenses) {
      const rubric  = exp.rubric;
      const group   = rubric?.group;
      const section = group?.section;
      const secCode = section?.code || 'GASTOS_GENERALES';
      const secName = section?.name || 'Gastos Generales';
      const grpName = group?.name   || 'Otros';
      const rubName = rubric?.name  || 'Sin clasificar';
      const amount  = Number(exp.total);

      if (!gastosPorSeccion[secCode]) gastosPorSeccion[secCode] = { name: secName, grupos: {}, total: 0 };
      if (!gastosPorSeccion[secCode].grupos[grpName]) gastosPorSeccion[secCode].grupos[grpName] = { rubrics: {}, total: 0 };
      if (!gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName]) gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName] = 0;

      gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName] += amount;
      gastosPorSeccion[secCode].grupos[grpName].total             += amount;
      gastosPorSeccion[secCode].total                             += amount;

      if (secCode === 'CONTRIBUCIONES') totalContribuciones += amount;
      else totalGastos += amount;
    }

    // 4. Nómina
    const payrollPeriods = await this.prisma.payrollPeriod.findMany({
      where: { companyId, period, status: 'PAGADO' },
    });
    const totalNomina = payrollPeriods.reduce((t, p) => t + Number(p.totalGross || 0), 0);

    const totalVentas           = ventaNeta + ventaCortes;
    const resultadoAntesContrib = totalVentas - totalGastos - totalNomina;
    const resultadoEjercicio    = resultadoAntesContrib - totalContribuciones;

    return {
      period,
      ventas: { bruta: ventaBruta, descuentos, neta: ventaNeta, cortes: ventaCortes, total: totalVentas },
      gastosPorSeccion,
      nomina:               totalNomina,
      totalGastos:          totalGastos + totalNomina,
      contribuciones:       totalContribuciones,
      resultadoAntesContrib,
      resultadoEjercicio,
    };
  }

  // ── ESTADO DE FLUJO DE EFECTIVO ───────────────────────────
  async getCashFlowStatement(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start  = new Date(y, m - 1, 1);
    const end    = new Date(y, m, 0, 23, 59, 59);

    // Saldo inicial (movimientos antes del período)
    const prevMovs = await this.prisma.flowMovement.findMany({
      where: { companyId, date: { lt: start } },
    });
    const saldoInicial = prevMovs.reduce((t, m) =>
      t + (m.type === 'ENTRADA' ? Number(m.amountMxn) : -Number(m.amountMxn)), 0);

    // Movimientos del período
    const movimientos = await this.prisma.flowMovement.findMany({
      where: { companyId, date: { gte: start, lte: end } },
      include: { cashAccount: { select: { name: true, type: true } } },
      orderBy: { date: 'asc' },
    });

    // Clasificar movimientos
    const operativos: any   = { entradas: [], salidas: [], total: 0 };
    const financieros: any  = { entradas: [], salidas: [], total: 0 };

    const OPERATIVO_TIPOS  = ['CORTE', 'GASTO', 'COMPRA_INSUMO', 'ABONO_CXC', 'PAGO_CXP', 'AJUSTE'];
    const FINANCIERO_TIPOS = ['DEPOSITO_CAJA', 'RETIRO_CAJA', 'RETIRO_SEGURIDAD', 'COMPRA_EXPRESS', 'TRASPASO', 'TRASPASO_ORIGEN', 'TRASPASO_DESTINO'];

    const LABELS: Record<string, string> = {
      CORTE:            'Cobros de ventas',
      GASTO:            'Pagos de gastos',
      COMPRA_INSUMO:    'Compras de insumos',
      ABONO_CXC:        'Cobros de CxC',
      PAGO_CXP:         'Pagos de CxP',
      AJUSTE:           'Ajustes',
      DEPOSITO_CAJA:    'Depósitos en caja',
      RETIRO_CAJA:      'Retiros de caja',
      RETIRO_SEGURIDAD: 'Retiros por seguridad',
      COMPRA_EXPRESS:   'Compras express',
      TRASPASO:         'Traspasos entre cuentas',
      TRASPASO_ORIGEN:  'Traspasos entre cuentas',
      TRASPASO_DESTINO: 'Traspasos entre cuentas',
    };

    for (const mov of movimientos) {
      const tipo      = mov.originType || 'AJUSTE';
      const monto     = Number(mov.amountMxn);
      const esEntrada = mov.type === 'ENTRADA';
      const label     = LABELS[tipo] || tipo;
      const item      = { label, monto, tipo, cuenta: mov.cashAccount?.name || '—', fecha: mov.date };

      const esOperativo = OPERATIVO_TIPOS.includes(tipo);
      const bucket      = esOperativo ? operativos : financieros;

      if (esEntrada) {
        bucket.entradas.push(item);
        bucket.total += monto;
      } else {
        bucket.salidas.push(item);
        bucket.total -= monto;
      }
    }

    const variacionNeta = operativos.total + financieros.total;
    const saldoFinal    = saldoInicial + variacionNeta;

    // Resumen por cuenta bancaria
    const accounts = await this.prisma.cashAccount.findMany({
      where: { companyId, isActive: true },
    });

    const saldosPorCuenta = await Promise.all(accounts.map(async (acc) => {
      const ins  = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'ENTRADA' }, _sum: { amountMxn: true } });
      const outs = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'SALIDA'  }, _sum: { amountMxn: true } });
      return {
        cuenta:   acc.name,
        tipo:     acc.type,
        moneda:   acc.currency,
        saldo:    Number(ins._sum.amountMxn || 0) - Number(outs._sum.amountMxn || 0),
      };
    }));

    return {
      period,
      saldoInicial,
      operativos,
      financieros,
      variacionNeta,
      saldoFinal,
      saldosPorCuenta,
      movimientos: movimientos.map(m => ({
        fecha:     m.date,
        tipo:      m.type,
        origen:    m.originType,
        monto:     Number(m.amountMxn),
        cuenta:    (m as any).cashAccount?.name || '—',
        notas:     m.notes,
      })),
    };
  }

  // ── BALANCE GENERAL ───────────────────────────────────────
  async getBalanceSheet(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const end    = new Date(y, m, 0, 23, 59, 59);

    // ACTIVOS — Efectivo y bancos
    const accounts = await this.prisma.cashAccount.findMany({
      where: { companyId, isActive: true },
    });
    const efectivoYBancos = await Promise.all(accounts.map(async (acc) => {
      const ins  = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'ENTRADA' }, _sum: { amountMxn: true } });
      const outs = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'SALIDA'  }, _sum: { amountMxn: true } });
      return { nombre: acc.name, tipo: acc.type, saldo: Number(ins._sum.amountMxn || 0) - Number(outs._sum.amountMxn || 0) };
    }));
    const totalEfectivo = efectivoYBancos.reduce((t, a) => t + a.saldo, 0);

    // ACTIVOS — Cuentas por cobrar
    const cxcPendientes = await this.prisma.receivable.findMany({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
      include: { client: { select: { name: true } } },
    });
    const cxcAdicionales = await this.prisma.cxC.findMany({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
      include: { client: { select: { name: true } } },
    });
    const totalCxC = cxcPendientes.reduce((t, c) => t + Number(c.balance), 0)
                   + cxcAdicionales.reduce((t, c) => t + Number(c.balance), 0);

    // ACTIVOS — Inventario (solo Machete)
    const productos = await this.prisma.product.findMany({
      where: { companyId, isActive: true },
      include: { currentStock: true },
    });
    const totalInventario = productos.reduce((t, p) => {
      const stock = Number((p as any).currentStock?.stock || 0);
      const costo = Number((p as any).priceMostrador || 0) * 0.4; // estimado 40% del precio
      return t + stock * costo;
    }, 0);

    const totalActivos = totalEfectivo + totalCxC + totalInventario;

    // PASIVOS — Cuentas por pagar
    const cxpPendientes = await this.prisma.payable.findMany({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
      include: { supplier: { select: { name: true } } },
    });
    const totalCxP = cxpPendientes.reduce((t, p) => t + Number(p.balance), 0);
    const totalPasivos = totalCxP;

    // PATRIMONIO
    const er = await this.getIncomeStatement(companyId, period);
    const resultadoPeriodo = er.resultadoEjercicio;
    const patrimonio       = totalActivos - totalPasivos;

    return {
      period,
      activos: {
        efectivoYBancos,
        totalEfectivo,
        cuentasPorCobrar: totalCxC,
        inventario:       totalInventario,
        total:            totalActivos,
      },
      pasivos: {
        cuentasPorPagar: totalCxP,
        total:           totalPasivos,
      },
      patrimonio: {
        resultadoPeriodo,
        total: patrimonio,
      },
    };
  }

  // ── DASHBOARD ─────────────────────────────────────────────
  async getDashboardData(companyId: string, period: string) {
    const [y, m] = period.split('-').map(Number);
    const start  = new Date(y, m - 1, 1);
    const end    = new Date(y, m, 0, 23, 59, 59);

    const er = await this.getIncomeStatement(companyId, period);

    // CxC pendiente
    const cxcPend = await this.prisma.receivable.aggregate({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
      _sum: { balance: true },
    });
    const cxcAdicPend = await this.prisma.cxC.aggregate({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
      _sum: { balance: true },
    });
    const totalCxC = Number(cxcPend._sum.balance || 0) + Number(cxcAdicPend._sum.balance || 0);

    // CxP pendiente
    const cxpPend = await this.prisma.payable.aggregate({
      where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
      _sum: { balance: true },
    });

    // Cortes pendientes de validación
    const cortesPendientes = await this.prisma.corteCaja.count({
      where: { companyId, status: 'PENDIENTE' },
    });

    // Stock bajo
    const stockBajo = await this.prisma.productStock.findMany({
      where: { companyId: undefined, product: { companyId, isActive: true } },
      include: { product: true },
    }).catch(() => []);

    // Ventas últimos 6 meses
    const ventasMeses = [];
    for (let i = 5; i >= 0; i--) {
      const d    = new Date(y, m - 1 - i, 1);
      const per  = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const erM  = await this.getIncomeStatement(companyId, per).catch(() => ({ ventas: { total: 0 } }));
      ventasMeses.push({ period: per, label: d.toLocaleDateString('es-MX', { month: 'short' }), total: erM.ventas?.total || 0 });
    }

    return {
      period,
      ventas:            er.ventas?.total || 0,
      resultado:         er.resultadoEjercicio || 0,
      totalGastos:       er.totalGastos || 0,
      cxcPendiente:      totalCxC,
      cxpPendiente:      Number(cxpPend._sum.balance || 0),
      cortesPendientes,
      ventasMeses,
    };
  }

  async getConsolidado(period: string) {
    const companies = await this.prisma.company.findMany({ where: { isActive: true } });
    const results   = await Promise.all(companies.map(async c => {
      const er = await this.getIncomeStatement(c.id, period);
      return {
        companyId:   c.id,
        companyName: c.name,
        companyCode: c.code,
        color:       c.color,
        netSale:     er.ventas?.total        || 0,
        expenses:    er.totalGastos          || 0,
        cxcBalance:  0,
        netIncome:   er.resultadoEjercicio   || 0,
      };
    }));

    const groupTotal = {
      netSale:    results.reduce((t, c) => t + Number(c.netSale),    0),
      expenses:   results.reduce((t, c) => t + Number(c.expenses),   0),
      cxcBalance: 0,
      netIncome:  results.reduce((t, c) => t + Number(c.netIncome),  0),
    };

    return { companies: results, groupTotal };
  }
}
