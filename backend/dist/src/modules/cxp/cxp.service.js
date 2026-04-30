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
exports.CxpService = void 0;
const flow_helper_1 = require("../shared/flow.helper");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CxpService = class CxpService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(companyId, period, status, supplierId) {
        const where = { companyId };
        if (status)
            where.status = status;
        if (supplierId)
            where.supplierId = supplierId;
        if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
        }
        return this.prisma.payable.findMany({
            where,
            include: { supplier: true, payments: true },
            orderBy: { date: 'desc' },
        });
    }
    async getSummary(companyId) {
        const pending = await this.prisma.payable.findMany({
            where: { companyId, status: { in: ['PENDIENTE', 'PARCIAL'] } },
        });
        const totalPending = pending.reduce((t, p) => t + Number(p.balance), 0);
        const totalOverdue = pending
            .filter(p => p.dueDate && new Date(p.dueDate) < new Date())
            .reduce((t, p) => t + Number(p.balance), 0);
        return { totalPending, totalOverdue, pendingCount: pending.length };
    }
    create(companyId, data) {
        const balance = Number(data.originalAmount);
        return this.prisma.payable.create({
            data: {
                companyId,
                supplierId: data.supplierId || null,
                rubricId: data.rubricId || null,
                concept: data.concept,
                date: new Date(data.date),
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                currency: data.currency || 'MXN',
                originalAmount: balance,
                paidAmount: 0,
                balance,
                status: 'PENDIENTE',
                notes: data.notes || null,
            },
        });
    }
    async addPayment(payableId, data) {
        const payable = await this.prisma.payable.findUnique({ where: { id: payableId } });
        if (!payable)
            throw new Error('CxP no encontrada');
        const newBalance = Number(payable.balance) - Number(data.amount);
        const newStatus = newBalance <= 0 ? 'PAGADO' : 'PARCIAL';
        const [payment] = await this.prisma.$transaction([
            this.prisma.payablePayment.create({
                data: {
                    payableId,
                    cashAccountId: data.cashAccountId || null,
                    date: new Date(data.date),
                    amount: Number(data.amount),
                    currency: data.currency || 'MXN',
                    exchangeRate: data.exchangeRate || 1,
                    paymentMethod: data.paymentMethod || 'EFECTIVO_MXN',
                    reference: data.reference || null,
                    notes: data.notes || null,
                },
            }),
            this.prisma.payable.update({
                where: { id: payableId },
                data: {
                    paidAmount: Number(payable.paidAmount) + Number(data.amount),
                    balance: newBalance,
                    status: newStatus,
                },
            }),
        ]);
        await (0, flow_helper_1.registrarFlujo)(this.prisma, payable.companyId, {
            type: 'SALIDA', originType: 'PAGO_CXP',
            originId: payment?.id,
            amount: Number(data.amount || 0),
            paymentMethod: data.paymentMethod || 'EFECTIVO',
            date: data.date ? new Date(data.date) : new Date(),
            notes: 'Pago a proveedor CxP',
        });
        return payment;
    }
    update(id, data) {
        return this.prisma.payable.update({
            where: { id },
            data: {
                concept: data.concept,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                notes: data.notes,
                supplierId: data.supplierId || undefined,
            },
        });
    }
    async cancelPayable(id, motivo) {
        const cxp = await this.prisma.payable.findUnique({ where: { id } });
        if (!cxp)
            throw new Error('CxP no encontrada');
        if (cxp.status === 'PAGADO')
            throw new Error('No se puede cancelar una CxP ya pagada');
        return this.prisma.payable.update({
            where: { id },
            data: { status: 'CANCELADA', notes: motivo ? `CANCELADA: ${motivo}` : 'CANCELADA' },
        });
    }
};
exports.CxpService = CxpService;
exports.CxpService = CxpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CxpService);
//# sourceMappingURL=cxp.service.js.map