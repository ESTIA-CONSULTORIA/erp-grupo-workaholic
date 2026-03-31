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
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ExpensesService = class ExpensesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(companyId, period, isExternal) {
        const where = { companyId };
        if (isExternal !== undefined)
            where.isExternal = isExternal === 'true';
        if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
        }
        return this.prisma.expense.findMany({
            where,
            include: { rubric: true, supplier: true },
            orderBy: { date: 'desc' },
        });
    }
    create(companyId, userId, data) {
        return this.prisma.expense.create({
            data: {
                companyId,
                rubricId: data.rubricId || null,
                supplierId: data.supplierId || null,
                cashAccountId: data.cashAccountId || null,
                date: new Date(data.date),
                concept: data.concept,
                subtotal: data.subtotal || 0,
                tax: data.tax || 0,
                total: (data.subtotal || 0) + (data.tax || 0),
                currency: data.currency || 'MXN',
                paymentMethod: data.paymentMethod || 'efectivo',
                paymentStatus: data.paymentStatus || 'PAGADO',
                invoiceRef: data.invoiceRef || null,
                userId: userId,
                totalMxn: (data.subtotal || 0) + (data.tax || 0),
                exchangeRate: 1,
                isExternal: data.isExternal || false,
                externalNotes: data.externalNotes || null,
            },
            include: { rubric: true, supplier: true },
        });
    }
    delete(id) {
        return this.prisma.expense.delete({ where: { id } });
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map