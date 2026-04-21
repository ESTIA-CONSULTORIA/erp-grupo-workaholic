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
            include: {
                supplier: true,
                rubric: {
                    include: {
                        group: {
                            include: {
                                section: { select: { name: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { date: 'desc' },
        });
    }
    async create(companyId, userId, data) {
        const subtotal = Number(data.subtotal || 0);
        const tax = Number(data.tax || 0);
        const total = subtotal + tax;
        const expense = await this.prisma.expense.create({
            data: {
                companyId,
                rubricId: data.rubricId || null,
                supplierId: data.supplierId || null,
                cashAccountId: data.cashAccountId || null,
                userId,
                date: new Date(data.date),
                concept: data.concept,
                subtotal,
                tax,
                total,
                currency: data.currency || 'MXN',
                exchangeRate: 1,
                totalMxn: total,
                paymentMethod: data.paymentMethod || 'EFECTIVO',
                paymentStatus: data.paymentStatus || 'PAGADO',
                invoiceRef: data.invoiceRef || null,
                isExternal: data.isExternal || false,
                externalNotes: data.externalNotes || null,
            },
            include: {
                supplier: true,
                rubric: {
                    include: {
                        group: {
                            include: {
                                section: { select: { name: true } }
                            }
                        }
                    }
                }
            },
        });
        if ((data.paymentStatus || 'PAGADO') === 'PAGADO' && data.paymentMethod !== 'CREDITO_CLIENTE' && data.paymentMethod !== 'credito') {
            try {
                const branch = await this.prisma.branch.findFirst({ where: { companyId } });
                let cashAccountId = data.cashAccountId;
                if (!cashAccountId) {
                    const metodo = data.paymentMethod || 'EFECTIVO';
                    const esEfectivo = metodo.includes('EFECTIVO');
                    const cuenta = await this.prisma.cashAccount.findFirst({
                        where: {
                            companyId,
                            isActive: true,
                            type: esEfectivo ? 'EFECTIVO' : { in: ['BANCO', 'PLATAFORMA'] },
                        },
                    });
                    cashAccountId = cuenta?.id;
                }
                if (branch && cashAccountId) {
                    await this.prisma.flowMovement.create({
                        data: {
                            companyId,
                            branchId: branch.id,
                            cashAccountId,
                            date: new Date(data.date),
                            type: 'SALIDA',
                            originType: 'GASTO',
                            originId: expense.id,
                            amount: total,
                            currency: data.currency || 'MXN',
                            exchangeRate: 1,
                            amountMxn: total,
                            notes: data.concept,
                        },
                    });
                }
            }
            catch (e) {
                console.error('ERROR FLOW GASTO:', e.message);
            }
        }
        return expense;
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