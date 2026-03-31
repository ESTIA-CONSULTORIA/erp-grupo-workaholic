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
        const end = new Date(y, m, 0);
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
    async getConsolidated(period) {
        const companies = await this.prisma.company.findMany({ where: { isActive: true } });
        const results = await Promise.all(companies.map(async (c) => {
            const data = await this.getIncomeStatement(c.id, period);
            return {
                companyId: c.id,
                companyName: c.name,
                color: c.color,
                netSale: data.summary.totalNetSale,
                expenses: data.summary.totalExpenses,
                netIncome: data.summary.netIncome,
                cxcBalance: 0,
            };
        }));
        const groupTotal = {
            netSale: results.reduce((t, c) => t + c.netSale, 0),
            expenses: results.reduce((t, c) => t + c.expenses, 0),
            netIncome: results.reduce((t, c) => t + c.netIncome, 0),
            cxcBalance: 0,
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