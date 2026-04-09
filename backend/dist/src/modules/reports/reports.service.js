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
        const expenses = await this.prisma.expense.findMany({
            where: { companyId, date: { gte: start, lte: end } },
            include: { rubric: { include: { group: { include: { section: true } } } } },
        });
        const gastosPorSeccion = {};
        let totalGastos = 0;
        let totalContribuciones = 0;
        for (const exp of expenses) {
            const rubric = exp.rubric;
            const group = rubric?.group;
            const section = group?.section;
            const secCode = section?.code || 'GASTOS_GENERALES';
            const secName = section?.name || 'Gastos Generales';
            const grpName = group?.name || 'Otros';
            const rubName = rubric?.name || 'Sin clasificar';
            const amount = Number(exp.total);
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
            gastosPorSeccion[secCode].grupos[grpName].total += amount;
            gastosPorSeccion[secCode].total += amount;
            if (secCode === 'CONTRIBUCIONES') {
                totalContribuciones += amount;
            }
            else {
                totalGastos += amount;
            }
        }
        const payrollPeriods = await this.prisma.payrollPeriod.findMany({
            where: { companyId, period, status: 'PAGADO' },
        });
        const totalNomina = payrollPeriods.reduce((t, p) => t + Number(p.totalGross || 0), 0);
        const totalVentas = ventaNeta + ventaCortes;
        const resultadoAntesContrib = totalVentas - totalGastos - totalNomina;
        const resultadoEjercicio = resultadoAntesContrib - totalContribuciones;
        return {
            period,
            ventas: {
                bruta: ventaBruta,
                descuentos,
                neta: ventaNeta,
                cortes: ventaCortes,
                total: totalVentas,
            },
            gastosPorSeccion,
            nomina: totalNomina,
            totalGastos: totalGastos + totalNomina,
            contribuciones: totalContribuciones,
            resultadoAntesContrib,
            resultadoEjercicio,
        };
    }
    async getConsolidado(period) {
        const companies = await this.prisma.company.findMany({ where: { isActive: true } });
        const results = await Promise.all(companies.map(async (c) => ({
            company: { id: c.id, name: c.name, code: c.code, color: c.color },
            er: await this.getIncomeStatement(c.id, period),
        })));
        return results;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map