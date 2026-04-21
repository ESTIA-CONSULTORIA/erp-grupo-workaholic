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
exports.PalestraService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PalestraService = class PalestraService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getServices(companyId) {
        return this.prisma.serviceCatalog.findMany({
            where: { companyId, isActive: true },
            orderBy: { type: 'asc' },
        });
    }
    createService(companyId, data) {
        return this.prisma.serviceCatalog.create({
            data: {
                companyId, name: data.name, description: data.description || null,
                type: data.type || 'SERVICIO', price: data.price,
                duration: data.duration || null, isActive: true,
                coachable: data.coachable || false, coachRate: data.coachRate || null,
            },
        });
    }
    updateService(id, data) {
        return this.prisma.serviceCatalog.update({ where: { id }, data });
    }
    toggleService(id, isActive) {
        return this.prisma.serviceCatalog.update({ where: { id }, data: { isActive } });
    }
    getMembershipTypes(companyId) {
        return this.prisma.membershipType.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    createMembershipType(companyId, data) {
        return this.prisma.membershipType.create({
            data: {
                companyId, name: data.name, description: data.description || null,
                entryFee: data.entryFee, monthlyFee: data.monthlyFee,
                maxMembers: data.maxMembers || 1, graceDays: data.graceDays || 5,
            },
        });
    }
    updateMembershipType(id, data) {
        return this.prisma.membershipType.update({ where: { id }, data });
    }
    async getMemberships(companyId, filters = {}) {
        const where = { companyId };
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { holderName: { contains: filters.search, mode: 'insensitive' } },
                { folio: { contains: filters.search, mode: 'insensitive' } },
                { holderEmail: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.membership.findMany({
            where,
            include: {
                membershipType: true,
                members: { orderBy: { isHolder: 'desc' } },
                payments: { orderBy: { dueDate: 'desc' }, take: 3 },
            },
            orderBy: { folio: 'asc' },
        });
    }
    async createMembership(companyId, data) {
        const count = await this.prisma.membership.count({ where: { companyId } });
        const folio = `PALS-${String(count + 1).padStart(4, '0')}`;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(today);
        due.setDate(1);
        due.setMonth(due.getMonth() + 1);
        const membership = await this.prisma.membership.create({
            data: {
                companyId, folio,
                membershipTypeId: data.membershipTypeId,
                holderName: data.holderName,
                holderEmail: data.holderEmail || null,
                holderPhone: data.holderPhone || null,
                holderRfc: data.holderRfc || null,
                groupName: data.groupName || null,
                startDate: today,
                status: 'ACTIVA',
                entryPaid: false,
                nextDueDate: due,
                notes: data.notes || null,
            },
        });
        await this.prisma.membershipMember.create({
            data: { membershipId: membership.id, name: data.holderName,
                email: data.holderEmail || null, phone: data.holderPhone || null,
                isHolder: true },
        });
        if (data.members?.length > 0) {
            for (const m of data.members) {
                await this.prisma.membershipMember.create({
                    data: { membershipId: membership.id, name: m.name,
                        email: m.email || null, phone: m.phone || null, isHolder: false },
                });
            }
        }
        return this.prisma.membership.findUnique({
            where: { id: membership.id },
            include: { membershipType: true, members: true, payments: true },
        });
    }
    addMember(membershipId, data) {
        return this.prisma.membershipMember.create({
            data: { membershipId, name: data.name, email: data.email || null,
                phone: data.phone || null, isHolder: false },
        });
    }
    removeMember(memberId) {
        return this.prisma.membershipMember.delete({ where: { id: memberId } });
    }
    async getMembershipPayments(membershipId) {
        return this.prisma.membershipPayment.findMany({
            where: { membershipId },
            orderBy: { dueDate: 'desc' },
        });
    }
    async registerPayment(membershipId, data) {
        const membership = await this.prisma.membership.findUnique({
            where: { id: membershipId },
            include: { membershipType: true },
        });
        if (!membership)
            throw new Error('Membresía no encontrada');
        const payment = await this.prisma.membershipPayment.create({
            data: {
                membershipId, companyId: membership.companyId,
                concept: data.concept || `Mantenimiento ${new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`,
                amount: data.amount || membership.membershipType.monthlyFee,
                paymentMethod: data.paymentMethod || 'EFECTIVO',
                reference: data.reference || null,
                dueDate: new Date(data.dueDate || membership.nextDueDate),
                paidAt: new Date(),
                status: 'PAGADO',
            },
        });
        const nextDue = new Date(membership.nextDueDate || new Date());
        nextDue.setMonth(nextDue.getMonth() + 1);
        await this.prisma.membership.update({
            where: { id: membershipId },
            data: {
                status: 'ACTIVA',
                lastPaymentDate: new Date(),
                nextDueDate: nextDue,
            },
        });
        await this.prisma.sale.create({
            data: {
                companyId: membership.companyId,
                date: new Date(),
                channel: 'MOSTRADOR',
                total: payment.amount,
                paymentMethod: payment.paymentMethod,
                isCredit: false,
            },
        });
        return payment;
    }
    async checkAndBlockOverdue(companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const memberships = await this.prisma.membership.findMany({
            where: { companyId, status: 'ACTIVA' },
            include: { membershipType: true },
        });
        let blocked = 0;
        for (const m of memberships) {
            if (!m.nextDueDate)
                continue;
            const due = new Date(m.nextDueDate);
            const graceDue = new Date(due);
            graceDue.setDate(graceDue.getDate() + m.membershipType.graceDays);
            if (today > graceDue) {
                await this.prisma.membership.update({
                    where: { id: m.id },
                    data: { status: 'MOROSA' },
                });
                blocked++;
            }
        }
        return { blocked };
    }
    async getCommissions(companyId, filters = {}) {
        const where = { companyId };
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
        if (filters.status)
            where.status = filters.status;
        if (filters.week)
            where.weekPeriod = filters.week;
        return this.prisma.coachCommission.findMany({
            where,
            include: { employee: { select: { id: true, firstName: true, lastName: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createCommission(companyId, data) {
        const weekPeriod = data.weekPeriod || this._getWeekPeriod();
        return this.prisma.coachCommission.create({
            data: {
                companyId,
                employeeId: data.employeeId,
                saleId: data.saleId || null,
                clientName: data.clientName,
                service: data.service,
                amount: data.amount,
                status: 'PENDIENTE',
                weekPeriod,
            },
        });
    }
    async releaseCommissions(companyId, weekPeriod, employeeId) {
        const where = { companyId, weekPeriod, status: 'PENDIENTE' };
        if (employeeId)
            where.employeeId = employeeId;
        return this.prisma.coachCommission.updateMany({ where, data: { status: 'LIBERADA' } });
    }
    async freezeCommission(id, reason) {
        return this.prisma.coachCommission.update({
            where: { id }, data: { status: 'CONGELADA', frozenReason: reason },
        });
    }
    async importSoftRestaurant(companyId, data, userId) {
        const fecha = new Date(data.fecha);
        fecha.setHours(0, 0, 0, 0);
        const existing = await this.prisma.softRestaurantImport.findFirst({
            where: { companyId, fecha },
        });
        if (existing) {
            return this.prisma.softRestaurantImport.update({
                where: { id: existing.id },
                data: {
                    totalVentas: data.totalVentas,
                    totalEfectivo: data.totalEfectivo || 0,
                    totalTarjeta: data.totalTarjeta || 0,
                    totalOtros: data.totalOtros || 0,
                    numTransacciones: data.numTransacciones || 0,
                    rawData: data.rawData || null,
                },
            });
        }
        const imp = await this.prisma.softRestaurantImport.create({
            data: {
                companyId, fecha,
                totalVentas: data.totalVentas,
                totalEfectivo: data.totalEfectivo || 0,
                totalTarjeta: data.totalTarjeta || 0,
                totalOtros: data.totalOtros || 0,
                numTransacciones: data.numTransacciones || 0,
                rawData: data.rawData || null,
                importedById: userId || null,
            },
        });
        await this.prisma.sale.create({
            data: {
                companyId, date: fecha, channel: 'RESTAURANTE',
                total: data.totalVentas,
                paymentMethod: 'MIXTO',
                isCredit: false,
                clientName: 'Soft Restaurant',
            },
        });
        return imp;
    }
    getSoftImports(companyId) {
        return this.prisma.softRestaurantImport.findMany({
            where: { companyId },
            orderBy: { fecha: 'desc' },
            take: 90,
        });
    }
    getProducts(companyId) {
        return this.prisma.palestraProduct.findMany({
            where: { companyId, isActive: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }
    createProduct(companyId, data) {
        return this.prisma.palestraProduct.create({
            data: {
                companyId, sku: data.sku, name: data.name,
                category: data.category || 'GENERAL',
                description: data.description || null,
                price: data.price, cost: data.cost || 0,
                stock: data.stock || 0, minStock: data.minStock || 2,
                imageUrl: data.imageUrl || null,
            },
        });
    }
    updateProduct(id, data) {
        return this.prisma.palestraProduct.update({ where: { id }, data });
    }
    async adjustStock(id, qty, notes) {
        return this.prisma.palestraProduct.update({
            where: { id },
            data: { stock: { increment: qty } },
        });
    }
    getLowStock(companyId) {
        return this.prisma.$queryRaw `
      SELECT * FROM palestra_products 
      WHERE "companyId" = ${companyId} AND "isActive" = true AND stock <= "minStock"
      ORDER BY stock ASC
    `;
    }
    async registerSale(companyId, userId, data) {
        const total = data.lines.reduce((t, l) => t + Number(l.price) * Number(l.qty), 0);
        const sale = await this.prisma.sale.create({
            data: {
                companyId,
                date: new Date(data.date || new Date()),
                channel: data.channel || 'MOSTRADOR',
                clientName: data.clientName || null,
                clientId: data.clientId || null,
                isCredit: data.isCredit || false,
                total,
                paymentMethod: data.paymentMethod || 'EFECTIVO',
            },
        });
        for (const line of data.lines) {
            if (line.productId && line.type === 'PRODUCTO') {
                await this.prisma.palestraProduct.update({
                    where: { id: line.productId },
                    data: { stock: { decrement: Number(line.qty) } },
                }).catch(() => { });
            }
            if (line.coachId && line.coachRate) {
                await this.prisma.coachCommission.create({
                    data: {
                        companyId,
                        employeeId: line.coachId,
                        saleId: sale.id,
                        clientName: data.clientName || 'Cliente',
                        service: line.name,
                        amount: line.coachRate,
                        status: 'PENDIENTE',
                        weekPeriod: this._getWeekPeriod(),
                    },
                });
            }
        }
        return sale;
    }
    _getWeekPeriod() {
        const now = new Date();
        const jan1 = new Date(now.getFullYear(), 0, 1);
        const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
    async getDashboard(companyId) {
        const [totalMembers, activeMembers, morosasCount, pendingCommissions] = await Promise.all([
            this.prisma.membership.count({ where: { companyId } }),
            this.prisma.membership.count({ where: { companyId, status: 'ACTIVA' } }),
            this.prisma.membership.count({ where: { companyId, status: 'MOROSA' } }),
            this.prisma.coachCommission.aggregate({
                where: { companyId, status: 'PENDIENTE' },
                _sum: { amount: true },
                _count: true,
            }),
        ]);
        return {
            totalMembers, activeMembers, morosasCount,
            pendingCommissions: {
                total: Number(pendingCommissions._sum.amount || 0),
                count: pendingCommissions._count,
            },
        };
    }
};
exports.PalestraService = PalestraService;
exports.PalestraService = PalestraService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PalestraService);
//# sourceMappingURL=palestra.service.js.map