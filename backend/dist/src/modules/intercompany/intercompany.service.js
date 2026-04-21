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
                lte: new Date(y, m, 0),
            };
        }
        return this.prisma.intercompanyTransfer.findMany({
            where,
            include: {
                fromCompany: { select: { id: true, name: true, color: true } },
                toCompany: { select: { id: true, name: true, color: true } },
            },
            orderBy: { date: 'desc' },
        });
    }
    async createTransfer(fromCompanyId, userId, data) {
        return this.prisma.intercompanyTransfer.create({
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
            },
            include: {
                fromCompany: { select: { id: true, name: true } },
                toCompany: { select: { id: true, name: true } },
            },
        });
    }
    async approveTransfer(transferId, userId, approved) {
        return this.prisma.intercompanyTransfer.update({
            where: { id: transferId },
            data: {
                status: approved ? 'APROBADO' : 'RECHAZADO',
                approvedById: userId,
                approvedAt: new Date(),
            },
        });
    }
};
exports.IntercompanyService = IntercompanyService;
exports.IntercompanyService = IntercompanyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntercompanyService);
//# sourceMappingURL=intercompany.service.js.map