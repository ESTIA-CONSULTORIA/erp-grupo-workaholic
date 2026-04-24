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
exports.LoncheService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let LoncheService = class LoncheService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getProducts(companyId) {
        return this.prisma.loncheProduct.findMany({
            where: { companyId, isActive: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }
    createProduct(companyId, data) {
        return this.prisma.loncheProduct.create({
            data: {
                companyId, sku: data.sku, name: data.name,
                category: data.category || 'OTRO',
                price: Number(data.price), cost: Number(data.cost || 0),
                cashbackPct: Number(data.cashbackPct || 0),
                stock: Number(data.stock || 0),
                imageUrl: data.imageUrl || null,
            },
        });
    }
    updateProduct(id, data) {
        return this.prisma.loncheProduct.update({ where: { id }, data });
    }
    async getTurnos(companyId) {
        return this.prisma.loncheTurno.findMany({
            where: { companyId },
            include: { surtidos: { include: { items: { include: { product: true } } } } },
            orderBy: { date: 'desc' }, take: 30,
        });
    }
    async getTurnoActivo(companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.prisma.loncheTurno.findFirst({
            where: { companyId, date: today, status: 'ABIERTO' },
            include: {
                surtidos: { include: { items: { include: { product: true } } } },
                sales: { include: { items: true } },
            },
        });
    }
    async abrirTurno(companyId, userId, cajeroName) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await this.prisma.loncheTurno.findFirst({
            where: { companyId, date: today, status: 'ABIERTO' },
        });
        if (existing)
            throw new Error('Ya hay un turno abierto hoy');
        return this.prisma.loncheTurno.create({
            data: { companyId, cajeroId: userId, cajeroName, date: today, status: 'ABIERTO' },
        });
    }
    async cerrarTurno(turnoId, data) {
        const turno = await this.prisma.loncheTurno.findUnique({
            where: { id: turnoId },
            include: { sales: true },
        });
        if (!turno)
            throw new Error('Turno no encontrado');
        const efectivoSistema = turno.sales
            .reduce((t, s) => t + Number(s.efectivoPaid || 0), 0);
        const diferencia = Number(data.efectivoDeclarado) - efectivoSistema;
        return this.prisma.loncheTurno.update({
            where: { id: turnoId },
            data: {
                status: 'CERRADO',
                efectivoDeclarado: Number(data.efectivoDeclarado),
                efectivoSistema,
                diferencia,
                notasCierre: data.notas || null,
                cierreAt: new Date(),
            },
        });
    }
    async validarTurno(turnoId, userId) {
        return this.prisma.loncheTurno.update({
            where: { id: turnoId },
            data: { status: 'VALIDADO', validadoPor: userId, validadoAt: new Date() },
        });
    }
    async crearSurtido(turnoId, companyId, userId, items, type = 'INICIAL') {
        const surtido = await this.prisma.loncheSurtido.create({
            data: { turnoId, companyId, type, createdById: userId },
        });
        for (const item of items) {
            if (!item.qty || Number(item.qty) <= 0)
                continue;
            await this.prisma.loncheSurtidoItem.create({
                data: {
                    surtidoId: surtido.id,
                    productId: item.productId,
                    qty: Number(item.qty),
                    costUnit: Number(item.costUnit || 0),
                },
            });
            await this.prisma.loncheProduct.update({
                where: { id: item.productId },
                data: { stock: { decrement: Number(item.qty) } },
            });
        }
        return this.prisma.loncheSurtido.findUnique({
            where: { id: surtido.id },
            include: { items: { include: { product: true } } },
        });
    }
    async registrarVenta(companyId, turnoId, data) {
        const turno = await this.prisma.loncheTurno.findUnique({ where: { id: turnoId } });
        if (!turno || turno.status !== 'ABIERTO')
            throw new Error('No hay turno activo');
        let total = 0;
        let cashbackTotal = 0;
        const itemsData = [];
        for (const line of data.items) {
            const product = await this.prisma.loncheProduct.findUnique({ where: { id: line.productId } });
            if (!product)
                continue;
            const lineTotal = Number(product.price) * Number(line.qty);
            const lineCashback = lineTotal * Number(product.cashbackPct) / 100;
            total += lineTotal;
            cashbackTotal += lineCashback;
            itemsData.push({
                productId: product.id, name: product.name,
                qty: Number(line.qty), price: Number(product.price),
                cashback: lineCashback,
            });
        }
        let prepagoPaid = 0;
        let efectivoPaid = 0;
        let studentId = data.studentId || null;
        if (data.paymentMethod === 'PREPAGO' || data.paymentMethod === 'MIXTO') {
            if (!data.studentId)
                throw new Error('Selecciona un alumno para pago con prepago');
            const student = await this.prisma.loncheStudent.findUnique({ where: { id: data.studentId } });
            if (!student)
                throw new Error('Alumno no encontrado');
            if (!student.isActive)
                throw new Error('Cuenta del alumno inactiva');
            if (student.dailyLimit) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const gastadoHoy = await this.prisma.loncheTransaction.aggregate({
                    where: { studentId: student.id, type: 'COMPRA', createdAt: { gte: today, lt: tomorrow } },
                    _sum: { amount: true },
                });
                const gastado = Math.abs(Number(gastadoHoy._sum.amount || 0));
                if (gastado + total > Number(student.dailyLimit)) {
                    throw new Error(`Límite diario excedido. Disponible hoy: $${(Number(student.dailyLimit) - gastado).toFixed(2)}`);
                }
            }
            if (data.paymentMethod === 'PREPAGO') {
                if (Number(student.balance) + Number(student.cashback) < total) {
                    throw new Error(`Saldo insuficiente. Saldo: $${(Number(student.balance) + Number(student.cashback)).toFixed(2)}`);
                }
                let remaining = total;
                if (Number(student.cashback) >= remaining) {
                    prepagoPaid = remaining;
                    await this.prisma.loncheStudent.update({ where: { id: student.id }, data: { cashback: { decrement: remaining } } });
                }
                else {
                    const cashUsed = Number(student.cashback);
                    remaining -= cashUsed;
                    prepagoPaid = total;
                    await this.prisma.loncheStudent.update({
                        where: { id: student.id },
                        data: { cashback: 0, balance: { decrement: remaining } },
                    });
                }
            }
            else {
                prepagoPaid = Math.min(total, Number(student.balance) + Number(student.cashback));
                efectivoPaid = total - prepagoPaid;
                await this.prisma.loncheStudent.update({ where: { id: student.id }, data: { balance: { decrement: prepagoPaid } } });
            }
            const newBalance = Number(student.balance) - prepagoPaid;
            await this.prisma.loncheTransaction.create({
                data: {
                    companyId, studentId: student.id, type: 'COMPRA',
                    amount: -total, balance: Math.max(0, newBalance),
                    notes: `${itemsData.length} artículo(s)`,
                },
            });
            if (cashbackTotal > 0) {
                await this.prisma.loncheStudent.update({ where: { id: student.id }, data: { cashback: { increment: cashbackTotal } } });
                await this.prisma.loncheTransaction.create({
                    data: {
                        companyId, studentId: student.id, type: 'CASHBACK',
                        amount: cashbackTotal, balance: Math.max(0, newBalance) + cashbackTotal,
                        notes: 'Cashback ganado en compra',
                    },
                });
            }
        }
        else {
            efectivoPaid = total;
        }
        const sale = await this.prisma.loncheSale.create({
            data: {
                companyId, turnoId,
                studentId: studentId || null,
                studentName: data.studentName || null,
                paymentMethod: data.paymentMethod || 'EFECTIVO',
                total, cashbackEarned: cashbackTotal,
                prepagoPaid, efectivoPaid,
                items: { create: itemsData },
            },
            include: { items: { include: { product: true } } },
        });
        await this.prisma.sale.create({
            data: {
                companyId, date: new Date(), channel: 'MOSTRADOR',
                clientName: data.studentName || 'Venta caja',
                total, paymentMethod: data.paymentMethod || 'EFECTIVO',
                isCredit: false,
            },
        });
        return sale;
    }
    getStudents(companyId, search) {
        const where = { companyId, isActive: true };
        if (search)
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { grade: { contains: search, mode: 'insensitive' } },
            ];
        return this.prisma.loncheStudent.findMany({ where, orderBy: [{ grade: 'asc' }, { name: 'asc' }] });
    }
    findStudentByCode(companyId, code) {
        return this.prisma.loncheStudent.findFirst({ where: { companyId, code, isActive: true } });
    }
    createStudent(companyId, data) {
        return this.prisma.loncheStudent.create({
            data: {
                companyId, code: data.code, name: data.name,
                grade: data.grade || null,
                tutorName: data.tutorName || null,
                tutorEmail: data.tutorEmail || null,
                tutorPhone: data.tutorPhone || null,
                dailyLimit: data.dailyLimit ? Number(data.dailyLimit) : null,
                balance: 0, cashback: 0,
            },
        });
    }
    updateStudent(id, data) {
        return this.prisma.loncheStudent.update({ where: { id }, data });
    }
    async recargar(companyId, studentId, data) {
        const student = await this.prisma.loncheStudent.findUnique({ where: { id: studentId } });
        if (!student)
            throw new Error('Alumno no encontrado');
        const amount = Number(data.amount);
        await this.prisma.loncheRecharge.create({
            data: {
                companyId, studentId, amount,
                paymentMethod: data.paymentMethod || 'EFECTIVO',
                reference: data.reference || null,
                rechargedById: data.rechargedById || null,
            },
        });
        const updated = await this.prisma.loncheStudent.update({
            where: { id: studentId },
            data: { balance: { increment: amount } },
        });
        await this.prisma.loncheTransaction.create({
            data: {
                companyId, studentId, type: 'RECARGA',
                amount, balance: Number(updated.balance),
                notes: `Recarga ${data.paymentMethod || 'EFECTIVO'}`,
            },
        });
        return updated;
    }
    getTransactions(companyId, studentId) {
        return this.prisma.loncheTransaction.findMany({
            where: { companyId, studentId },
            orderBy: { createdAt: 'desc' }, take: 50,
        });
    }
    async getReporteCooperativa(companyId, desde, hasta) {
        const start = new Date(desde);
        start.setHours(0, 0, 0, 0);
        const end = new Date(hasta);
        end.setHours(23, 59, 59, 999);
        const [ventas, recargas, turnos] = await Promise.all([
            this.prisma.loncheSale.findMany({
                where: { companyId, createdAt: { gte: start, lte: end } },
                include: { items: { include: { product: true } } },
            }),
            this.prisma.loncheRecharge.findMany({
                where: { companyId, createdAt: { gte: start, lte: end } },
                include: { student: true },
            }),
            this.prisma.loncheTurno.findMany({
                where: { companyId, date: { gte: start, lte: end } },
            }),
        ]);
        const totalVentas = ventas.reduce((t, v) => t + Number(v.total), 0);
        const totalPrepago = ventas.reduce((t, v) => t + Number(v.prepagoPaid), 0);
        const totalEfectivo = ventas.reduce((t, v) => t + Number(v.efectivoPaid), 0);
        const totalCashback = ventas.reduce((t, v) => t + Number(v.cashbackEarned), 0);
        const totalRecargas = recargas.reduce((t, r) => t + Number(r.amount), 0);
        const byProduct = {};
        for (const v of ventas) {
            for (const item of v.items) {
                if (!byProduct[item.productId])
                    byProduct[item.productId] = { name: item.name, qty: 0, total: 0 };
                byProduct[item.productId].qty += Number(item.qty);
                byProduct[item.productId].total += Number(item.price) * Number(item.qty);
            }
        }
        return {
            periodo: { desde, hasta },
            resumen: { totalVentas, totalPrepago, totalEfectivo, totalCashback, totalRecargas },
            turnos: turnos.map(t => ({ fecha: t.date, cajero: t.cajeroName, diferencia: t.diferencia, status: t.status })),
            porProducto: Object.values(byProduct).sort((a, b) => b.total - a.total),
        };
    }
    async getReporteTutor(companyId, studentId, desde, hasta) {
        const start = new Date(desde);
        start.setHours(0, 0, 0, 0);
        const end = new Date(hasta);
        end.setHours(23, 59, 59, 999);
        const [student, transactions, sales] = await Promise.all([
            this.prisma.loncheStudent.findUnique({ where: { id: studentId } }),
            this.prisma.loncheTransaction.findMany({
                where: { studentId, createdAt: { gte: start, lte: end } },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.loncheSale.findMany({
                where: { companyId, studentId, createdAt: { gte: start, lte: end } },
                include: { items: { include: { product: true } } },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return { student, transactions, sales };
    }
    async getDashboard(companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [turnoActivo, ventasHoy, students, totalCashback] = await Promise.all([
            this.prisma.loncheTurno.findFirst({ where: { companyId, date: today, status: 'ABIERTO' } }),
            this.prisma.loncheSale.aggregate({
                where: { companyId, createdAt: { gte: today } },
                _sum: { total: true, cashbackEarned: true },
                _count: true,
            }),
            this.prisma.loncheStudent.count({ where: { companyId, isActive: true } }),
            this.prisma.loncheStudent.aggregate({
                where: { companyId, isActive: true },
                _sum: { balance: true, cashback: true },
            }),
        ]);
        return {
            turnoActivo: !!turnoActivo,
            ventasHoy: Number(ventasHoy._sum.total || 0),
            ticketsHoy: ventasHoy._count,
            cashbackHoy: Number(ventasHoy._sum.cashbackEarned || 0),
            students,
            saldoTotal: Number(totalCashback._sum.balance || 0),
            cashbackTotal: Number(totalCashback._sum.cashback || 0),
        };
    }
};
exports.LoncheService = LoncheService;
exports.LoncheService = LoncheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LoncheService);
//# sourceMappingURL=lonche.service.js.map