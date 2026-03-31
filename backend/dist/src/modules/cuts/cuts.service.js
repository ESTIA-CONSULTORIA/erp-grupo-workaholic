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
exports.CutsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CutsService = class CutsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(companyId, period) {
        const where = { companyId };
        if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
        }
        return this.prisma.cut.findMany({
            where,
            include: {
                lines: { include: { rubric: true } },
                branch: true,
                createdBy: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
        });
    }
    create(companyId, userId, data) {
        const nextFolio = `C-${Date.now()}`;
        return this.prisma.cut.create({
            data: {
                companyId,
                branchId: data.branchId,
                createdById: userId,
                folio: nextFolio,
                date: new Date(data.date),
                notes: data.notes,
                status: 'BORRADOR',
                lines: {
                    create: data.lines.map((l) => ({
                        rubricId: l.rubricId,
                        paymentType: l.paymentType || 'CONTADO',
                        currency: l.currency || 'MXN',
                        cashAccountId: l.cashAccountId || null,
                        clientId: l.clientId || null,
                        grossAmount: l.grossAmount || 0,
                        discount: l.discount || 0,
                        courtesy: l.courtesy || 0,
                        netAmount: (l.grossAmount || 0) - (l.discount || 0) - (l.courtesy || 0),
                    })),
                },
            },
            include: { lines: { include: { rubric: true } } },
        });
    }
    submit(id) {
        return this.prisma.cut.update({ where: { id }, data: { status: 'ENVIADO' } });
    }
    approve(id) {
        return this.prisma.cut.update({ where: { id }, data: { status: 'APROBADO' } });
    }
};
exports.CutsService = CutsService;
exports.CutsService = CutsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CutsService);
//# sourceMappingURL=cuts.service.js.map