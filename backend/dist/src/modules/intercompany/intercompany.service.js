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
            where.date = {
                gte: new Date(y, m - 1, 1),
                lt: new Date(y, m, 1),
            };
        }
        return this.prisma.intercompanyTransfer.findMany({
            where,
            include: {
                fromCompany: { select: { id: true, name: true } },
                toCompany: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createTransfer(fromCompanyId, userId, data) {
        const count = await this.prisma.intercompanyTransfer.count();
        const folio = `ICT-${String(count + 1).padStart(4, '0')}`;
        return this.prisma.intercompanyTransfer.create({
            data: {
                folio,
                fromCompanyId,
                toCompanyId: data.toCompanyId,
                amount: Number(data.amount),
                currency: data.currency || 'MXN',
                concept: data.concept,
                date: new Date(data.date),
                status: 'PENDIENTE',
                requestedById: userId,
                notes: data.notes || null,
            },
            include: {
                fromCompany: { select: { id: true, name: true } },
                toCompany: { select: { id: true, name: true } },
            },
        });
    }
    async approveTransfer(transferId, userId, approved) {
        const t = await this.prisma.intercompanyTransfer.findUnique({ where: { id: transferId } });
        if (!t)
            throw new Error('Transferencia no encontrada');
        const updated = await this.prisma.intercompanyTransfer.update({
            where: { id: transferId },
            data: {
                status: approved ? 'APROBADO' : 'RECHAZADO',
                approvedById: userId,
                approvedAt: new Date(),
            },
            include: {
                fromCompany: { select: { id: true, name: true } },
                toCompany: { select: { id: true, name: true } },
            },
        });
        if (approved) {
            const ref = t.folio || transferId.slice(-6);
            await this.prisma.flowMovement.createMany({
                data: [
                    {
                        companyId: t.fromCompanyId,
                        type: 'EGRESO',
                        amount: t.amount,
                        concept: `Intercompany salida: ${ref} — ${t.concept}`,
                        date: t.date,
                        paymentMethod: 'TRANSFERENCIA',
                        reference: ref,
                    },
                    {
                        companyId: t.toCompanyId,
                        type: 'INGRESO',
                        amount: t.amount,
                        concept: `Intercompany entrada: ${ref} — ${t.concept}`,
                        date: t.date,
                        paymentMethod: 'TRANSFERENCIA',
                        reference: ref,
                    },
                ],
            }).catch(() => { });
        }
        return updated;
    }
};
exports.IntercompanyService = IntercompanyService;
exports.IntercompanyService = IntercompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntercompanyService);
//# sourceMappingURL=intercompany.service.js.map