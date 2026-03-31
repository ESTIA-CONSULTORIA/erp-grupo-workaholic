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
exports.FlowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let FlowService = class FlowService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalances(companyId) {
        const accounts = await this.prisma.cashAccount.findMany({
            where: { companyId, isActive: true },
        });
        const balances = await Promise.all(accounts.map(async (acc) => {
            const inflows = await this.prisma.flowMovement.aggregate({
                where: { companyId, cashAccountId: acc.id, type: 'ENTRADA' },
                _sum: { amountMxn: true },
            });
            const outflows = await this.prisma.flowMovement.aggregate({
                where: { companyId, cashAccountId: acc.id, type: 'SALIDA' },
                _sum: { amountMxn: true },
            });
            const balance = Number(inflows._sum.amountMxn || 0) - Number(outflows._sum.amountMxn || 0);
            return {
                accountId: acc.id,
                accountCode: acc.code,
                accountName: acc.name,
                type: acc.type,
                currency: acc.currency,
                bankName: acc.bankName,
                balance,
            };
        }));
        const totalMxn = balances.filter(b => b.currency === 'MXN').reduce((t, b) => t + b.balance, 0);
        const totalUsd = balances.filter(b => b.currency === 'USD').reduce((t, b) => t + b.balance, 0);
        return { accounts: balances, totalMxn, totalUsd };
    }
    async transfer(companyId, data) {
        const branch = await this.prisma.branch.findFirst({ where: { companyId } });
        return this.prisma.$transaction([
            this.prisma.flowMovement.create({
                data: {
                    companyId, branchId: branch.id,
                    cashAccountId: data.fromAccountId,
                    date: new Date(data.date),
                    type: 'SALIDA', originType: 'TRASPASO', originId: data.toAccountId,
                    amount: data.amount, currency: data.currency || 'MXN',
                    exchangeRate: 1, amountMxn: data.amount,
                    notes: data.notes,
                },
            }),
            this.prisma.flowMovement.create({
                data: {
                    companyId, branchId: branch.id,
                    cashAccountId: data.toAccountId,
                    date: new Date(data.date),
                    type: 'ENTRADA', originType: 'TRASPASO', originId: data.fromAccountId,
                    amount: data.amount, currency: data.currency || 'MXN',
                    exchangeRate: 1, amountMxn: data.amount,
                    notes: data.notes,
                },
            }),
        ]);
    }
};
exports.FlowService = FlowService;
exports.FlowService = FlowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlowService);
//# sourceMappingURL=flow.service.js.map