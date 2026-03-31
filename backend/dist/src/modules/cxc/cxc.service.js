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
exports.CxcService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CxcService = class CxcService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(companyId, period, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
        }
        return this.prisma.cxC.findMany({
            where,
            include: { client: true, payments: true },
            orderBy: { date: 'desc' },
        });
    }
    async getSummary(companyId) {
        const pending = await this.prisma.cxC.findMany({
            where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
        });
        const totalPending = pending.reduce((t, c) => t + Number(c.balance), 0);
        const totalOverdue = pending.filter(c => c.status === 'VENCIDO')
            .reduce((t, c) => t + Number(c.balance), 0);
        return { totalPending, totalOverdue, pendingCount: pending.length };
    }
    async addPayment(cxcId, cashAccountId, data) {
        const cxc = await this.prisma.cxC.findUnique({ where: { id: cxcId } });
        if (!cxc)
            throw new Error('CxC no encontrada');
        const newBalance = Number(cxc.balance) - Number(data.amount);
        const newStatus = newBalance <= 0 ? 'PAGADO' : 'PARCIAL';
        return this.prisma.$transaction([
            this.prisma.cxCPayment.create({
                data: {
                    cxcId,
                    amount: data.amount,
                    currency: data.currency || 'MXN',
                    paymentMethod: data.paymentMethod || 'EFECTIVO_MXN',
                    date: new Date(data.date),
                    reference: data.reference || null,
                    cashAccountId,
                },
            }),
            this.prisma.cxC.update({
                where: { id: cxcId },
                data: {
                    paidAmount: Number(cxc.paidAmount) + Number(data.amount),
                    balance: newBalance,
                    status: newStatus,
                },
            }),
        ]);
    }
};
exports.CxcService = CxcService;
exports.CxcService = CxcService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CxcService);
//# sourceMappingURL=cxc.service.js.map