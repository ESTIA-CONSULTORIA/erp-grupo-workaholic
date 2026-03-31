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
exports.MacheteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let MacheteService = class MacheteService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getProducts(companyId) {
        return this.prisma.product.findMany({
            where: { companyId },
            include: { currentStock: true },
            orderBy: [{ meatType: 'asc' }, { flavor: 'asc' }],
        });
    }
    async getPTInventory(companyId) {
        const products = await this.prisma.product.findMany({
            where: { companyId, isActive: true },
            include: { currentStock: true },
        });
        return products.map(p => ({
            ...p,
            stock: p.currentStock?.stock || 0,
            minStock: p.currentStock?.minStock || 5,
            lowStock: (p.currentStock?.stock || 0) < (p.currentStock?.minStock || 5),
        }));
    }
    getRecipes(companyId) {
        return this.prisma.recipe.findMany({
            where: { companyId, isActive: true },
            include: { ingredients: true },
            orderBy: { key: 'asc' },
        });
    }
    getSales(companyId, period, channel) {
        const where = { companyId };
        if (channel)
            where.channel = channel;
        if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
        }
        return this.prisma.sale.findMany({
            where,
            include: { lines: { include: { product: true } } },
            orderBy: { date: 'desc' },
        });
    }
    async registerSale(companyId, data) {
        const total = data.lines.reduce((t, l) => t + l.quantity * l.unitPrice, 0);
        return this.prisma.sale.create({
            data: {
                companyId,
                date: new Date(data.date),
                channel: data.channel,
                clientName: data.clientName || null,
                total,
                paymentMethod: data.paymentMethod || 'efectivo',
                lines: {
                    create: data.lines.map((l) => ({
                        productId: l.productId,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                        total: l.quantity * l.unitPrice,
                    })),
                },
            },
            include: { lines: { include: { product: true } } },
        });
    }
    async getSalesReport(companyId, period) {
        const [y, m] = period.split('-').map(Number);
        const sales = await this.prisma.sale.findMany({
            where: {
                companyId,
                date: { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) },
            },
            include: { lines: { include: { product: true } } },
        });
        const byChannel = {};
        const bySKU = {};
        let totalRevenue = 0;
        let totalUnits = 0;
        for (const sale of sales) {
            byChannel[sale.channel] = (byChannel[sale.channel] || 0) + Number(sale.total);
            totalRevenue += Number(sale.total);
            for (const line of sale.lines) {
                totalUnits += line.quantity;
                if (!bySKU[line.product.sku])
                    bySKU[line.product.sku] = { name: line.product.name, units: 0, revenue: 0 };
                bySKU[line.product.sku].units += line.quantity;
                bySKU[line.product.sku].revenue += Number(line.total);
            }
        }
        return {
            period, totalRevenue, totalUnits,
            byChannel: Object.entries(byChannel).map(([canal, revenue]) => ({ canal, revenue })),
            bySKU: Object.values(bySKU).sort((a, b) => b.revenue - a.revenue),
            production: { lotes: 0, totalKgIn: 0, totalKgOut: 0, totalWaste: 0, avgYield: 0 },
        };
    }
};
exports.MacheteService = MacheteService;
exports.MacheteService = MacheteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MacheteService);
//# sourceMappingURL=machete.service.js.map