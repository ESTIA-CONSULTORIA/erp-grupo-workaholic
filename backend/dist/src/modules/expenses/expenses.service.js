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
        const currency = data.currency || 'MXN';
        const exchangeRate = Number(data.exchangeRate || 1);
        const totalMxn = currency === 'MXN' ? total : total * exchangeRate;
        const paymentStatus = data.paymentStatus || 'PAGADO';
        const paymentMethod = data.paymentMethod || (paymentStatus === 'PENDIENTE' ? 'CREDITO' : 'EFECTIVO');
        return this.prisma.$transaction(async (tx) => {
            const expense = await tx.expense.create({
                data: {
                    companyId,
                    rubricId: data.rubricId || null,
                    supplierId: data.supplierId || null,
                    cashAccountId: data.cashAccountId || null,
                    userId,
                    date: new Date(data.date),
                    concept: data.concept,
                    description: data.description || null,
                    subtotal,
                    tax,
                    total,
                    currency,
                    exchangeRate,
                    totalMxn,
                    paymentMethod,
                    paymentStatus,
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
            if (paymentStatus === 'PENDIENTE' || paymentMethod === 'CREDITO') {
                const dueDate = data.dueDate
                    ? new Date(data.dueDate)
                    : new Date(new Date(data.date || new Date()).setDate(new Date(data.date || new Date()).getDate() + 30));
                await tx.payable.create({
                    data: {
                        companyId,
                        supplierId: data.supplierId || null,
                        rubricId: data.rubricId || null,
                        concept: `Gasto: ${data.concept}`,
                        date: new Date(data.date),
                        dueDate,
                        currency,
                        originalAmount: total,
                        paidAmount: 0,
                        balance: total,
                        status: 'PENDIENTE',
                        notes: `Generado automáticamente del gasto ${expense.id}${data.invoiceRef ? ` · Factura ${data.invoiceRef}` : ''}`,
                    },
                });
            }
            if (paymentStatus === 'PAGADO' && paymentMethod !== 'CREDITO' && paymentMethod !== 'CREDITO_CLIENTE') {
                const branch = await tx.branch.findFirst({ where: { companyId } });
                let cashAccountId = data.cashAccountId;
                if (!cashAccountId) {
                    const metodo = String(paymentMethod || '').toUpperCase();
                    const esEfectivo = metodo.includes('EFECTIVO');
                    const cuenta = await tx.cashAccount.findFirst({
                        where: {
                            companyId,
                            isActive: true,
                            type: esEfectivo ? 'EFECTIVO' : { in: ['BANCO', 'PLATAFORMA'] },
                            currency,
                        },
                    });
                    cashAccountId = cuenta?.id;
                }
                if (branch && cashAccountId) {
                    await tx.flowMovement.create({
                        data: {
                            companyId,
                            branchId: branch.id,
                            cashAccountId,
                            date: new Date(data.date),
                            type: 'SALIDA',
                            originType: 'GASTO',
                            originId: expense.id,
                            rubricId: data.rubricId || null,
                            amount: total,
                            currency,
                            exchangeRate,
                            amountMxn: totalMxn,
                            reference: data.invoiceRef || null,
                            notes: data.concept,
                        },
                    });
                }
            }
            return expense;
        });
    }
    update(id, data) {
        return this.prisma.expense.update({
            where: { id },
            data: {
                concept: data.concept,
                subtotal: data.subtotal ? Number(data.subtotal) : undefined,
                tax: data.tax !== undefined ? Number(data.tax) : undefined,
                total: data.subtotal && data.tax ? Number(data.subtotal) + Number(data.tax) : undefined,
                date: data.date ? new Date(data.date) : undefined,
                paymentMethod: data.paymentMethod || undefined,
                rubricId: data.rubricId || undefined,
                supplierId: data.supplierId || undefined,
            },
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