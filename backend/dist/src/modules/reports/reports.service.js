"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getIncomeStatement(companyId, period) {
        const [y, m] = period.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);
        const sales = await this.prisma.sale.findMany({
            where: { companyId, date: { gte: start, lte: end } },
        });
        const ventaBruta = sales.reduce((t, s) => t + Number(s.total), 0);
        const descuentos = sales.reduce((t, s) => t + Number(s.discount || 0), 0);
        const ventaNeta = ventaBruta - descuentos;
        const cuts = await this.prisma.cut.findMany({
            where: { companyId, status: 'APROBADO', date: { gte: start, lte: end } },
            include: { lines: true },
        });
        const ventaCortes = cuts.reduce((t, c) => t + c.lines.reduce((tt, l) => tt + Number(l.netAmount || 0), 0), 0);
        const expenses = await this.prisma.expense.findMany({
            where: { companyId, date: { gte: start, lte: end } },
            include: { rubric: { include: { group: { include: { section: true } } } } },
        });
        const gastosPorSeccion = {};
        let totalGastos = 0, totalContribuciones = 0;
        for (const exp of expenses) {
            const rubric = exp.rubric;
            const group = rubric?.group;
            const section = group?.section;
            const secCode = section?.code || 'GASTOS_GENERALES';
            const secName = section?.name || 'Gastos Generales';
            const grpName = group?.name || 'Otros';
            const rubName = rubric?.name || 'Sin clasificar';
            const amount = Number(exp.total);
            if (!gastosPorSeccion[secCode])
                gastosPorSeccion[secCode] = { name: secName, grupos: {}, total: 0 };
            if (!gastosPorSeccion[secCode].grupos[grpName])
                gastosPorSeccion[secCode].grupos[grpName] = { rubrics: {}, total: 0 };
            if (!gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName])
                gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName] = 0;
            gastosPorSeccion[secCode].grupos[grpName].rubrics[rubName] += amount;
            gastosPorSeccion[secCode].grupos[grpName].total += amount;
            gastosPorSeccion[secCode].total += amount;
            if (secCode === 'CONTRIBUCIONES')
                totalContribuciones += amount;
            else
                totalGastos += amount;
        }
        const saleLines = await this.prisma.saleLine.findMany({
            where: { sale: { companyId, date: { gte: start, lte: end } } },
            select: { productId: true, quantity: true },
        });
        const cantidadesPorProducto = {};
        for (const line of saleLines) {
            cantidadesPorProducto[line.productId] = (cantidadesPorProducto[line.productId] || 0) + Number(line.quantity);
        }
        const productIds = Object.keys(cantidadesPorProducto);
        let costoVentas = 0;
        if (productIds.length > 0) {
            const ultimosEmpaques = await Promise.all(productIds.map(pid => this.prisma.loteEmpaque.findFirst({
                where: { productId: pid, costoUnit: { gt: 0 } },
                orderBy: { createdAt: 'desc' },
                select: { productId: true, costoUnit: true },
            })));
            for (const emp of ultimosEmpaques) {
                if (emp && Number(emp.costoUnit) > 0) {
                    costoVentas += Number(emp.costoUnit) * (cantidadesPorProducto[emp.productId] || 0);
                }
            }
        }
        const payrollPeriods = await this.prisma.payrollPeriod.findMany({
            where: { companyId, period, status: 'PAGADO' },
        });
        const totalNomina = payrollPeriods.reduce((t, p) => t + Number(p.totalGross || 0), 0);
        const totalVentas = ventaNeta + ventaCortes;
        const utilidadBruta = totalVentas - costoVentas;
        const resultadoAntesContrib = utilidadBruta - totalGastos - totalNomina;
        const resultadoEjercicio = resultadoAntesContrib - totalContribuciones;
        return {
            period,
            ventas: { bruta: ventaBruta, descuentos, neta: ventaNeta, cortes: ventaCortes, total: totalVentas },
            costoVentas,
            utilidadBruta,
            gastosPorSeccion,
            nomina: totalNomina,
            totalGastos: totalGastos + totalNomina,
            contribuciones: totalContribuciones,
            resultadoAntesContrib,
            resultadoEjercicio,
        };
    }
    async getCashFlowStatement(companyId, period) {
        const [y, m] = period.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);
        const prevMovs = await this.prisma.flowMovement.findMany({
            where: { companyId, date: { lt: start } },
        });
        const saldoInicial = prevMovs.reduce((t, m) => t + (m.type === 'ENTRADA' ? Number(m.amountMxn) : -Number(m.amountMxn)), 0);
        const movimientos = await this.prisma.flowMovement.findMany({
            where: { companyId, date: { gte: start, lte: end } },
            include: { cashAccount: { select: { name: true, type: true } } },
            orderBy: { date: 'asc' },
        });
        const operativos = { entradas: [], salidas: [], total: 0 };
        const financieros = { entradas: [], salidas: [], total: 0 };
        const OPERATIVO_TIPOS = ['CORTE', 'GASTO', 'COMPRA_INSUMO', 'ABONO_CXC', 'PAGO_CXP', 'AJUSTE'];
        const FINANCIERO_TIPOS = ['DEPOSITO_CAJA', 'RETIRO_CAJA', 'RETIRO_SEGURIDAD', 'COMPRA_EXPRESS', 'TRASPASO', 'TRASPASO_ORIGEN', 'TRASPASO_DESTINO'];
        const LABELS = {
            CORTE: 'Cobros de ventas',
            GASTO: 'Pagos de gastos',
            COMPRA_INSUMO: 'Compras de insumos',
            ABONO_CXC: 'Cobros de CxC',
            PAGO_CXP: 'Pagos de CxP',
            AJUSTE: 'Ajustes',
            DEPOSITO_CAJA: 'Depósitos en caja',
            RETIRO_CAJA: 'Retiros de caja',
            RETIRO_SEGURIDAD: 'Retiros por seguridad',
            COMPRA_EXPRESS: 'Compras express',
            TRASPASO: 'Traspasos entre cuentas',
            TRASPASO_ORIGEN: 'Traspasos entre cuentas',
            TRASPASO_DESTINO: 'Traspasos entre cuentas',
        };
        for (const mov of movimientos) {
            const tipo = mov.originType || 'AJUSTE';
            const monto = Number(mov.amountMxn);
            const esEntrada = mov.type === 'ENTRADA';
            const label = LABELS[tipo] || tipo;
            const item = { label, monto, tipo, cuenta: mov.cashAccount?.name || '—', fecha: mov.date };
            const esOperativo = OPERATIVO_TIPOS.includes(tipo);
            const bucket = esOperativo ? operativos : financieros;
            if (esEntrada) {
                bucket.entradas.push(item);
                bucket.total += monto;
            }
            else {
                bucket.salidas.push(item);
                bucket.total -= monto;
            }
        }
        const variacionNeta = operativos.total + financieros.total;
        const saldoFinal = saldoInicial + variacionNeta;
        const accounts = await this.prisma.cashAccount.findMany({
            where: { companyId, isActive: true },
        });
        const saldosPorCuenta = await Promise.all(accounts.map(async (acc) => {
            const ins = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'ENTRADA' }, _sum: { amountMxn: true } });
            const outs = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'SALIDA' }, _sum: { amountMxn: true } });
            return {
                cuenta: acc.name,
                tipo: acc.type,
                moneda: acc.currency,
                saldo: Number(ins._sum.amountMxn || 0) - Number(outs._sum.amountMxn || 0),
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
                fecha: m.date,
                tipo: m.type,
                origen: m.originType,
                monto: Number(m.amountMxn),
                cuenta: m.cashAccount?.name || '—',
                notas: m.notes,
            })),
        };
    }
    async getBalanceSheet(companyId, period) {
        const [y, m] = period.split('-').map(Number);
        const end = new Date(y, m, 0, 23, 59, 59);
        const accounts = await this.prisma.cashAccount.findMany({
            where: { companyId, isActive: true },
        });
        const efectivoYBancos = await Promise.all(accounts.map(async (acc) => {
            const ins = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'ENTRADA' }, _sum: { amountMxn: true } });
            const outs = await this.prisma.flowMovement.aggregate({ where: { companyId, cashAccountId: acc.id, type: 'SALIDA' }, _sum: { amountMxn: true } });
            return { nombre: acc.name, tipo: acc.type, saldo: Number(ins._sum.amountMxn || 0) - Number(outs._sum.amountMxn || 0) };
        }));
        const totalEfectivo = efectivoYBancos.reduce((t, a) => t + a.saldo, 0);
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
        const productos = await this.prisma.product.findMany({
            where: { companyId, isActive: true },
            include: { currentStock: true },
        });
        const totalInventario = productos.reduce((t, p) => {
            const stock = Number(p.currentStock?.stock || 0);
            const costo = Number(p.priceMostrador || 0) * 0.4;
            return t + stock * costo;
        }, 0);
        const totalActivos = totalEfectivo + totalCxC + totalInventario;
        const cxpPendientes = await this.prisma.payable.findMany({
            where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
            include: { supplier: { select: { name: true } } },
        });
        const totalCxP = cxpPendientes.reduce((t, p) => t + Number(p.balance), 0);
        const totalPasivos = totalCxP;
        const er = await this.getIncomeStatement(companyId, period);
        const resultadoPeriodo = er.resultadoEjercicio;
        const patrimonio = totalActivos - totalPasivos;
        return {
            period,
            activos: {
                efectivoYBancos,
                totalEfectivo,
                cuentasPorCobrar: totalCxC,
                inventario: totalInventario,
                total: totalActivos,
            },
            pasivos: {
                cuentasPorPagar: totalCxP,
                total: totalPasivos,
            },
            patrimonio: {
                resultadoPeriodo,
                total: patrimonio,
            },
        };
    }
    async getDashboardData(companyId, period) {
        const [y, m] = period.split('-').map(Number);
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59);
        const er = await this.getIncomeStatement(companyId, period);
        const cxcPend = await this.prisma.receivable.aggregate({
            where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
            _sum: { balance: true },
        });
        const cxcAdicPend = await this.prisma.cxC.aggregate({
            where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
            _sum: { balance: true },
        });
        const totalCxC = Number(cxcPend._sum.balance || 0) + Number(cxcAdicPend._sum.balance || 0);
        const cxpPend = await this.prisma.payable.aggregate({
            where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
            _sum: { balance: true },
        });
        const cortesPendientes = await this.prisma.corteCaja.count({
            where: { companyId, status: 'PENDIENTE' },
        });
        const stockBajo = await this.prisma.productStock.findMany({
            where: { companyId: undefined, product: { companyId, isActive: true } },
            include: { product: true },
        }).catch(() => []);
        const ventasMeses = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(y, m - 1 - i, 1);
            const per = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const erM = await this.getIncomeStatement(companyId, per).catch(() => ({ ventas: { total: 0 } }));
            ventasMeses.push({ period: per, label: d.toLocaleDateString('es-MX', { month: 'short' }), total: erM.ventas?.total || 0 });
        }
        const saleLines = await this.prisma.saleLine.findMany({
            where: { sale: { companyId, date: { gte: start, lte: end } } },
            include: { product: { select: { id: true, sku: true, name: true } } },
        }).catch(() => []);
        const prodMap = {};
        for (const l of saleLines) {
            const key = l.productId;
            if (!prodMap[key])
                prodMap[key] = { sku: l.product?.sku || '', name: l.product?.name || '', qty: 0, total: 0 };
            prodMap[key].qty += Number(l.quantity);
            prodMap[key].total += Number(l.subtotal || 0);
        }
        const topProductos = Object.values(prodMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);
        return {
            period,
            ventas: er.ventas?.total || 0,
            resultado: er.resultadoEjercicio || 0,
            totalGastos: er.totalGastos || 0,
            costoVentas: er.costoVentas || 0,
            utilidadBruta: er.utilidadBruta || 0,
            cxcPendiente: totalCxC,
            cxpPendiente: Number(cxpPend._sum.balance || 0),
            cortesPendientes,
            ventasMeses,
            topProductos,
        };
    }
    async fixOCSalesRetroactive(companyId) {
        const ocs = await this.prisma.ordenCompra.findMany({
            where: { companyId, status: { not: 'CANCELADA' } },
            include: { lineas: { include: { product: true } } },
        });
        let created = 0;
        const errors = [];
        for (const oc of ocs) {
            const existing = await this.prisma.sale.findFirst({
                where: {
                    companyId,
                    clientId: oc.clientId,
                    isCredit: true,
                    total: oc.montoTotal,
                    date: {
                        gte: new Date(new Date(oc.fecha).setHours(0, 0, 0, 0)),
                        lte: new Date(new Date(oc.fecha).setHours(23, 59, 59, 999)),
                    },
                },
            });
            if (existing)
                continue;
            try {
                await this.prisma.sale.create({
                    data: {
                        companyId,
                        clientId: oc.clientId,
                        date: new Date(oc.fecha),
                        channel: oc.canal || 'MOSTRADOR',
                        isCredit: true,
                        total: oc.montoTotal,
                        paymentMethod: 'CREDITO_CLIENTE',
                        lines: oc.lineas.length > 0 ? {
                            create: oc.lineas.map((l) => ({
                                productId: l.productId,
                                quantity: l.cantidad,
                                unitPrice: l.precioUnitario,
                                total: l.total,
                            })),
                        } : undefined,
                    },
                });
                created++;
            }
            catch (e) {
                errors.push(`OC ${oc.numero}: ${e.message}`);
            }
        }
        return { total: ocs.length, created, errors };
    }
    async getConsolidado(period) {
        const companies = await this.prisma.company.findMany({ where: { isActive: true } });
        const results = await Promise.all(companies.map(async (c) => {
            const er = await this.getIncomeStatement(c.id, period);
            return {
                companyId: c.id,
                companyName: c.name,
                companyCode: c.code,
                color: c.color,
                netSale: er.ventas?.total || 0,
                expenses: er.totalGastos || 0,
                cxcBalance: 0,
                netIncome: er.resultadoEjercicio || 0,
            };
        }));
        const groupTotal = {
            netSale: results.reduce((t, c) => t + Number(c.netSale), 0),
            expenses: results.reduce((t, c) => t + Number(c.expenses), 0),
            cxcBalance: 0,
            netIncome: results.reduce((t, c) => t + Number(c.netIncome), 0),
        };
        return { companies: results, groupTotal };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map