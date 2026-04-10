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
    getLotes(companyId) {
        return this.prisma.loteProduccion.findMany({
            where: { companyId },
            include: {
                insumos: true,
                empaques: { include: { product: true } },
            },
            orderBy: { fecha: 'desc' },
        });
    }
    async crearLote(companyId, userId, data) {
        const lote = await this.prisma.loteProduccion.create({
            data: {
                companyId,
                fecha: new Date(data.fecha),
                tipo: data.tipo,
                kgEntrada: data.kgEntrada || 0,
                notas: data.notas || null,
                creadoPor: userId,
                status: 'EN_PROCESO',
            },
        });
        return lote;
    }
    async registrarSalidaHorno(loteId, data) {
        const lote = await this.prisma.loteProduccion.findUnique({ where: { id: loteId } });
        if (!lote)
            throw new Error('Lote no encontrado');
        const kgEntrada = Number(lote.kgEntrada);
        const kgSalida = Number(data.kgSalida || 0);
        const kgGrasa = Number(data.kgGrasa || 0);
        const kgEscarchado = Number(data.kgEscarchado || 0);
        const kgMerma = kgEntrada - kgSalida - kgGrasa;
        const rendimiento = kgEntrada > 0 ? (kgSalida / kgEntrada) * 100 : 0;
        return this.prisma.loteProduccion.update({
            where: { id: loteId },
            data: {
                kgSalida,
                kgGrasa,
                kgEscarchado,
                kgMerma,
                rendimiento,
                status: 'EN_PROCESO',
            },
        });
    }
    async registrarEmpaque(loteId, data) {
        for (const linea of data.lineas) {
            await this.prisma.loteEmpaque.create({
                data: {
                    loteId,
                    productId: linea.productId,
                    cantidad: linea.cantidad,
                    costoUnit: linea.costoUnit || 0,
                },
            });
            await this.prisma.productStock.updateMany({
                where: { productId: linea.productId },
                data: { stock: { increment: linea.cantidad } },
            });
        }
        return this.prisma.loteProduccion.update({
            where: { id: loteId },
            data: { status: 'EMPACADO' },
        });
    }
    async cerrarLote(loteId) {
        return this.prisma.loteProduccion.update({
            where: { id: loteId },
            data: { status: 'CERRADO' },
        });
    }
    updateProduct(productId, data) {
        return this.prisma.product.update({
            where: { id: productId },
            data: {
                priceMostrador: data.priceMostrador !== undefined ? Number(data.priceMostrador) : undefined,
                priceMayoreo: data.priceMayoreo !== undefined ? Number(data.priceMayoreo) : undefined,
                priceOnline: data.priceOnline !== undefined ? Number(data.priceOnline) : undefined,
                priceML: data.priceML !== undefined ? Number(data.priceML) : undefined,
                name: data.name || undefined,
                isActive: data.isActive !== undefined ? data.isActive : undefined,
            },
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
    getInsumos(companyId) {
        return this.prisma.insumo.findMany({
            where: { companyId, isActive: true },
            orderBy: [{ group: 'asc' }, { name: 'asc' }],
        });
    }
    async comprarInsumo(companyId, data) {
        const cantidad = Number(data.cantidad);
        const costoUnitario = Number(data.costoUnitario);
        const total = cantidad * costoUnitario;
        await this.prisma.insumo.update({
            where: { id: data.insumoId },
            data: { stock: { increment: cantidad }, costUnit: costoUnitario },
        });
        const branch = await this.prisma.branch.findFirst({ where: { companyId } });
        if (data.metodoPago !== 'credito' && branch) {
            const cuenta = await this.prisma.cashAccount.findFirst({
                where: { companyId, code: data.cuentaId || 'efectivo_mxn', isActive: true },
            });
            if (cuenta) {
                await this.prisma.flowMovement.create({
                    data: {
                        companyId,
                        branchId: branch.id,
                        cashAccountId: cuenta.id,
                        date: new Date(data.fecha),
                        type: 'SALIDA',
                        originType: 'COMPRA_INSUMO',
                        originId: data.insumoId,
                        amount: total,
                        currency: 'MXN',
                        exchangeRate: 1,
                        amountMxn: total,
                        notes: `Compra: ${data.nombreInsumo} x ${cantidad} ${data.unidad}`,
                    },
                });
            }
        }
        return { success: true, total };
    }
    getRecipes(companyId) {
        return this.prisma.recipe.findMany({
            where: { companyId, isActive: true },
            include: { ingredients: true },
            orderBy: { key: 'asc' },
        });
    }
    getSales(companyId, period, channel, startDate, endDate) {
        const where = { companyId };
        if (channel)
            where.channel = channel;
        if (startDate && endDate) {
            where.date = { gte: new Date(startDate), lte: new Date(endDate) };
        }
        else if (period) {
            const [y, m] = period.split('-').map(Number);
            where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
        }
        return this.prisma.sale.findMany({
            where,
            include: {
                lines: { include: { product: true } },
                client: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' },
        });
    }
    async registerSale(companyId, data) {
        console.log('SALE DATA:', JSON.stringify({ isCredit: data.isCredit, paymentMethod: data.paymentMethod, clientId: data.clientId }));
        const total = data.lines.reduce((t, l) => t + l.quantity * l.unitPrice, 0);
        const sale = await this.prisma.$transaction(async (tx) => {
            const s = await tx.sale.create({
                data: {
                    companyId,
                    date: new Date(data.date),
                    channel: data.channel,
                    clientName: data.clientName || null,
                    clientId: data.clientId || null,
                    isCredit: data.isCredit || false,
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
            for (const line of s.lines) {
                await tx.productStock.updateMany({
                    where: { productId: line.productId },
                    data: { stock: { decrement: line.quantity } },
                });
            }
            return s;
        });
        if ((data.isCredit === true || data.isCredit === 'true' || data.paymentMethod === 'credito') && data.clientId) {
            try {
                const saleDate = new Date(data.date);
                saleDate.setHours(0, 0, 0, 0);
                const dueDate = new Date(saleDate);
                dueDate.setDate(dueDate.getDate() + 30);
                const cxc = await this.prisma.receivable.create({
                    data: {
                        companyId,
                        clientId: data.clientId,
                        date: saleDate,
                        dueDate,
                        originalAmount: total,
                        paidAmount: 0,
                        balance: total,
                        currency: 'MXN',
                        status: 'PENDIENTE',
                    },
                });
                console.log('CXC CREADO:', cxc.id);
            }
            catch (e) {
                console.error('ERROR CXC:', e.message);
            }
        }
        if (data.ocId) {
            try {
                const orden = await this.prisma.ordenCompra.findUnique({
                    where: { id: data.ocId },
                    include: { lineas: true },
                });
                if (orden) {
                    const montoSurtido = Number(orden.montoSurtido) + total;
                    const saldo = Number(orden.montoTotal) - montoSurtido;
                    const status = saldo <= 0 ? 'SURTIDO_COMPLETO' : 'SURTIDO_PARCIAL';
                    await this.prisma.ordenCompra.update({
                        where: { id: data.ocId },
                        data: { montoSurtido, saldo: Math.max(0, saldo), status },
                    });
                    await this.prisma.surtidoOC.create({
                        data: {
                            ordenCompraId: data.ocId,
                            fecha: new Date(data.date),
                            monto: total,
                            notes: `Surtido desde POS — venta ${sale.id}`,
                        },
                    });
                }
            }
            catch (e) {
                console.error('ERROR OC:', e.message);
            }
        }
        return sale;
    }
};
exports.MacheteService = MacheteService;
exports.MacheteService = MacheteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MacheteService);
//# sourceMappingURL=machete.service.js.map