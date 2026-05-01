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
exports.IntercompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let IntercompanyService = class IntercompanyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTransfers(companyId, period) {
        const where = {
            OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
        };
        if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
        }
        return this.prisma.intercompanyTransfer.findMany({
            where,
            include: {
                fromCompany: { select: { id: true, name: true, color: true } },
                toCompany: { select: { id: true, name: true, color: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createTransfer(fromCompanyId, userId, data) {
        const count = await this.prisma.intercompanyTransfer.count();
        const folio = `ICT-${String(count + 1).padStart(4, '0')}`;
        const transfer = await this.prisma.intercompanyTransfer.create({
            data: {
                fromCompanyId,
                toCompanyId: data.toCompanyId,
                amount: Number(data.amount),
                currency: data.currency || 'MXN',
                concept: data.concept,
                date: new Date(data.date),
                status: 'PENDIENTE',
                requestedById: userId,
                notes: data.notes || null,
                ...(folio ? { folio } : {}),
                ...(data.fromCashAccountId ? { fromCashAccountId: data.fromCashAccountId } : {}),
                ...(data.toCashAccountId ? { toCashAccountId: data.toCashAccountId } : {}),
            },
            include: {
                fromCompany: { select: { id: true, name: true, color: true } },
                toCompany: { select: { id: true, name: true, color: true } },
            },
        });
        await this._notificarReceptores(transfer, 'NUEVA').catch(() => { });
        return transfer;
    }
    async approveTransfer(transferId, userId, approved, motivo) {
        const t = await this.prisma.intercompanyTransfer.findUnique({
            where: { id: transferId },
            include: {
                fromCompany: { select: { id: true, name: true } },
                toCompany: { select: { id: true, name: true } },
            },
        });
        if (!t)
            throw new Error('Transferencia no encontrada');
        if (t.status !== 'PENDIENTE')
            throw new Error(`La transferencia ya está ${t.status}`);
        const updated = await this.prisma.intercompanyTransfer.update({
            where: { id: transferId },
            data: {
                status: approved ? 'APROBADO' : 'RECHAZADO',
                approvedById: userId,
                approvedAt: new Date(),
                rejectedReason: !approved ? (motivo || 'Rechazado') : null,
            },
            include: {
                fromCompany: { select: { id: true, name: true, color: true } },
                toCompany: { select: { id: true, name: true, color: true } },
            },
        });
        if (approved) {
            await this._registrarMovimientos(t).catch(e => console.error('FlowMovement IC error:', e.message));
        }
        await this._notificarEmisor(updated, approved, motivo).catch(() => { });
        return updated;
    }
    async _registrarMovimientos(t) {
        const ref = t.folio || t.id.slice(-6);
        const getDefaultAccount = async (companyId, cashAccountId) => {
            if (cashAccountId)
                return cashAccountId;
            const acc = await this.prisma.cashAccount.findFirst({
                where: { companyId, isActive: true, type: 'BANCO' },
            }).catch(() => null);
            const fallback = await this.prisma.cashAccount.findFirst({
                where: { companyId, isActive: true },
            }).catch(() => null);
            return acc?.id || fallback?.id || null;
        };
        const fromAccId = await getDefaultAccount(t.fromCompanyId, t.fromCashAccountId);
        const toAccId = await getDefaultAccount(t.toCompanyId, t.toCashAccountId);
        const getBranch = async (companyId) => {
            const branch = await this.prisma.branch.findFirst({ where: { companyId } }).catch(() => null);
            return branch?.id || null;
        };
        const fromBranch = await getBranch(t.fromCompanyId);
        const toBranch = await getBranch(t.toCompanyId);
        const movements = [];
        if (fromAccId && fromBranch) {
            movements.push({
                companyId: t.fromCompanyId,
                branchId: fromBranch,
                cashAccountId: fromAccId,
                date: t.date,
                type: 'SALIDA',
                originType: 'TRASPASO',
                originId: t.id,
                amount: t.amount,
                amountMxn: t.amount,
                currency: t.currency || 'MXN',
                reference: ref,
                notes: `${ref} → ${t.toCompany?.name}: ${t.concept}`,
            });
        }
        else {
            console.warn(`IC: empresa origen ${t.fromCompanyId} sin cuenta/sucursal — movimiento omitido`);
        }
        if (toAccId && toBranch) {
            movements.push({
                companyId: t.toCompanyId,
                branchId: toBranch,
                cashAccountId: toAccId,
                date: t.date,
                type: 'ENTRADA',
                originType: 'TRASPASO',
                originId: t.id,
                amount: t.amount,
                amountMxn: t.amount,
                currency: t.currency || 'MXN',
                reference: ref,
                notes: `${ref} ← ${t.fromCompany?.name}: ${t.concept}`,
            });
        }
        else {
            console.warn(`IC: empresa destino ${t.toCompanyId} sin cuenta/sucursal — movimiento omitido`);
        }
        if (movements.length > 0) {
            await this.prisma.flowMovement.createMany({ data: movements });
        }
        return movements.length;
    }
    async _notificarReceptores(transfer, tipo) {
        const roles = await this.prisma.userCompanyRole.findMany({
            where: {
                companyId: transfer.toCompanyId,
                role: { code: { in: ['admin', 'administrador', 'contador', 'gerente', 'director'] } },
            },
            include: { user: { select: { id: true } } },
        }).catch(() => []);
        if (!roles.length)
            return;
        await this.prisma.notification.createMany({
            data: roles.map((r) => ({
                companyId: transfer.toCompanyId,
                userId: r.user.id,
                type: 'INTERCOMPANY',
                title: `Nueva transferencia: ${transfer.folio}`,
                body: `${transfer.fromCompany?.name} solicita transferir ${transfer.currency} ${Number(transfer.amount).toFixed(2)} — "${transfer.concept}". Revisa y valida o rechaza.`,
                actionUrl: '/intercompany',
                priority: 'HIGH',
                channel: 'IN_APP',
            })),
            skipDuplicates: true,
        }).catch(() => { });
    }
    async _notificarEmisor(transfer, approved, motivo) {
        const roles = await this.prisma.userCompanyRole.findMany({
            where: {
                companyId: transfer.fromCompanyId,
                role: { code: { in: ['admin', 'administrador', 'contador', 'gerente', 'director'] } },
            },
            include: { user: { select: { id: true } } },
        }).catch(() => []);
        if (!roles.length)
            return;
        await this.prisma.notification.createMany({
            data: roles.map((r) => ({
                companyId: transfer.fromCompanyId,
                userId: r.user.id,
                type: 'INTERCOMPANY',
                title: approved
                    ? `✅ ${transfer.folio} aprobada por ${transfer.toCompany?.name}`
                    : `❌ ${transfer.folio} rechazada por ${transfer.toCompany?.name}`,
                body: approved
                    ? `La transferencia de ${transfer.currency} ${Number(transfer.amount).toFixed(2)} fue aprobada y registrada en ambas empresas.`
                    : `Motivo: ${motivo || 'Sin motivo especificado'}`,
                actionUrl: '/intercompany',
                priority: 'HIGH',
                channel: 'IN_APP',
            })),
            skipDuplicates: true,
        }).catch(() => { });
    }
};
exports.IntercompanyService = IntercompanyService;
exports.IntercompanyService = IntercompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntercompanyService);
//# sourceMappingURL=intercompany.service.js.map