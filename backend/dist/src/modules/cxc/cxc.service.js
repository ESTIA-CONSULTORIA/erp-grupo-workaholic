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
    findAll(companyId, period, status, clientId, startDate, endDate) {
        const where = { companyId };
        if (status)
            where.status = status;
        if (clientId)
            where.clientId = clientId;
        if (startDate && endDate) {
            where.date = { gte: new Date(startDate), lte: new Date(endDate) };
        }
        else if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
        }
        return this.prisma.receivable.findMany({
            where,
            include: {
                client: true,
                payments: { orderBy: { date: 'desc' } },
            },
            orderBy: { date: 'desc' },
        });
    }
    async getSummary(companyId, clientId) {
        const where = { companyId, status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } };
        if (clientId)
            where.clientId = clientId;
        const pending = await this.prisma.receivable.findMany({ where });
        const totalPending = pending.reduce((t, c) => t + Number(c.balance), 0);
        const totalOverdue = pending
            .filter(c => c.dueDate && new Date(c.dueDate) < new Date())
            .reduce((t, c) => t + Number(c.balance), 0);
        return { totalPending, totalOverdue, pendingCount: pending.length };
    }
    async addPayment(receivableId, cashAccountId, data) {
        const rec = await this.prisma.receivable.findUnique({ where: { id: receivableId } });
        if (!rec)
            throw new Error('CxC no encontrada');
        const newBalance = Number(rec.balance) - Number(data.amount);
        const newStatus = newBalance <= 0 ? 'PAGADO' : 'PARCIAL';
        const fecha = new Date(data.date + 'T12:00:00');
        return this.prisma.$transaction([
            this.prisma.receivablePayment.create({
                data: {
                    receivableId,
                    amount: data.amount,
                    currency: data.currency || 'MXN',
                    paymentMethod: data.paymentMethod || 'EFECTIVO_MXN',
                    date: fecha,
                    reference: data.reference || null,
                    cashAccountId: cashAccountId || null,
                },
            }),
            this.prisma.receivable.update({
                where: { id: receivableId },
                data: {
                    paidAmount: Number(rec.paidAmount) + Number(data.amount),
                    balance: newBalance,
                    status: newStatus,
                },
            }),
        ]);
    }
    async cancelReceivable(id, motivo) {
        const cxc = await this.prisma.receivable.findUnique({ where: { id } });
        if (!cxc)
            throw new Error('CxC no encontrada');
        if (cxc.status === 'PAGADA' || cxc.status === 'COBRADA')
            throw new Error('No se puede cancelar una CxC ya pagada');
        return this.prisma.receivable.update({
            where: { id },
            data: { status: 'CANCELADA', notes: motivo ? `CANCELADA: ${motivo}` : 'CANCELADA' },
        });
    }
};
exports.CxcService = CxcService;
exports.CxcService = CxcService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CxcService);
//# sourceMappingURL=cxc.service.js.map