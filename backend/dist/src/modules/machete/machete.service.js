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
        const CARNE_SKU = {
            MACHETE_RES: 'INS-CARNE-RES',
            CHICALI_RES: 'INS-CARNE-RES',
            CERDO: 'INS-CARNE-CERDO',
            MACHACA: 'INS-CARNE-RES',
        };
        const carneSku = CARNE_SKU[data.tipo];
        if (carneSku && data.kgEntrada > 0) {
            const carneInsumo = await this.prisma.insumo.findFirst({
                where: { companyId, sku: carneSku, isActive: true },
            });
            if (carneInsumo) {
                const cantidad = Number(data.kgEntrada);
                const costoTotal = cantidad * Number(carneInsumo.costUnit);
                await this.prisma.loteInsumo.create({
                    data: {
                        loteId: lote.id,
                        insumoId: carneInsumo.id,
                        nombre: carneInsumo.name,
                        cantidad,
                        unidad: carneInsumo.unit,
                        costoUnitario: Number(carneInsumo.costUnit),
                        costoTotal,
                    },
                });
                await this.prisma.insumo.update({
                    where: { id: carneInsumo.id },
                    data: { stock: { decrement: cantidad } },
                });
            }
        }
        if (data.insumos && data.insumos.length > 0) {
            for (const ins of data.insumos) {
                if (!ins.insumoId || !ins.cantidad)
                    continue;
                const insumo = await this.prisma.insumo.findUnique({
                    where: { id: ins.insumoId },
                });
                if (!insumo)
                    continue;
                const costoTotal = Number(ins.cantidad) * Number(insumo.costUnit);
                await this.prisma.loteInsumo.create({
                    data: {
                        loteId: lote.id,
                        insumoId: ins.insumoId,
                        nombre: insumo.name,
                        cantidad: Number(ins.cantidad),
                        unidad: insumo.unit,
                        costoUnitario: Number(insumo.costUnit),
                        costoTotal,
                    },
                });
                await this.prisma.insumo.update({
                    where: { id: ins.insumoId },
                    data: { stock: { decrement: Number(ins.cantidad) } },
                });
            }
        }
        return this.prisma.loteProduccion.findUnique({
            where: { id: lote.id },
            include: { insumos: true },
        });
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
            data: { kgSalida, kgGrasa, kgEscarchado, kgMerma, rendimiento, status: 'EMPACADO' },
        });
    }
    async registrarEmpaque(loteId, data) {
        const lote = await this.prisma.loteProduccion.findUnique({
            where: { id: loteId },
            include: { insumos: true },
        });
        if (!lote)
            throw new Error('Lote no encontrado');
        const costoTotalInsumos = lote.insumos.reduce((t, i) => t + Number(i.costoTotal), 0);
        const kgSalida = Number(lote.kgSalida) || 1;
        const costoKg = costoTotalInsumos / kgSalida;
        for (const linea of data.lineas) {
            const producto = await this.prisma.product.findUnique({
                where: { id: linea.productId },
            });
            const gramsWeight = Number(producto?.gramsWeight || 0);
            const costoUnit = gramsWeight > 0 ? (gramsWeight / 1000) * costoKg : 0;
            await this.prisma.loteEmpaque.create({
                data: {
                    loteId,
                    productId: linea.productId,
                    cantidad: linea.cantidad,
                    costoUnit,
                },
            });
            await this.prisma.productStock.updateMany({
                where: { productId: linea.productId },
                data: { stock: { increment: linea.cantidad } },
            });
        }
        const loteActualizado = await this.prisma.loteProduccion.findUnique({
            where: { id: loteId },
            include: { empaques: { include: { product: true } } },
        });
        const kgYaEmpacados = (loteActualizado?.empaques || []).reduce((t, e) => {
            const gramsWeight = Number(e.product?.gramsWeight || 0);
            return t + (gramsWeight > 0 ? (Number(e.cantidad) * gramsWeight) / 1000 : 0);
        }, 0);
        const kgDisponibles = Math.max(0, Number(loteActualizado?.kgSalida || 0) - kgYaEmpacados);
        const nuevoStatus = kgDisponibles <= 0.01 ? 'CERRADO' : 'EMPACADO';
        return this.prisma.loteProduccion.update({
            where: { id: loteId },
            data: { status: nuevoStatus },
            include: { empaques: { include: { product: true } }, insumos: true },
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
                sku: data.sku || undefined,
                meatType: data.meatType || undefined,
                flavor: data.flavor || undefined,
                presentation: data.presentation || undefined,
                gramsWeight: data.gramsWeight !== undefined ? Number(data.gramsWeight) : undefined,
            },
        });
    }
    async createProduct(companyId, data) {
        const product = await this.prisma.product.create({
            data: {
                companyId,
                sku: data.sku,
                name: data.name,
                meatType: data.meatType,
                flavor: data.flavor,
                presentation: data.presentation,
                gramsWeight: data.gramsWeight ? Number(data.gramsWeight) : null,
                priceMostrador: data.priceMostrador ? Number(data.priceMostrador) : null,
                priceMayoreo: data.priceMayoreo ? Number(data.priceMayoreo) : null,
                priceOnline: data.priceOnline ? Number(data.priceOnline) : null,
                priceML: data.priceML ? Number(data.priceML) : null,
                isActive: true,
            },
        });
        await this.prisma.productStock.create({
            data: { productId: product.id, stock: 0, minStock: data.minStock ? Number(data.minStock) : 5 },
        });
        return product;
    }
    async getPTInventory(companyId) {
        const products = await this.prisma.product.findMany({
            where: { companyId, isActive: true },
            include: { currentStock: true },
        });
        return products.map(p => ({
            ...p,
            stock: Number(p.currentStock?.stock || 0),
            minStock: Number(p.currentStock?.minStock || 5),
            maxStock: Number(p.currentStock?.maxStock || 0),
            lowStock: Number(p.currentStock?.stock || 0) < Number(p.currentStock?.minStock || 5),
        }));
    }
    async updateProductStock(productId, data) {
        return this.prisma.productStock.upsert({
            where: { productId },
            update: {
                minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
                maxStock: data.maxStock !== undefined ? Number(data.maxStock) : undefined,
            },
            create: {
                productId,
                stock: 0,
                minStock: data.minStock !== undefined ? Number(data.minStock) : 5,
                maxStock: data.maxStock !== undefined ? Number(data.maxStock) : 0,
            },
        });
    }
    getInsumos(companyId) {
        return this.prisma.insumo.findMany({
            where: { companyId, isActive: true },
            orderBy: [{ group: 'asc' }, { name: 'asc' }],
        });
    }
    async createInsumo(companyId, data) {
        return this.prisma.insumo.create({
            data: {
                companyId,
                sku: data.sku,
                name: data.name,
                unit: data.unit || 'kg',
                costUnit: data.costUnit ? Number(data.costUnit) : 0,
                group: data.group || 'GENERAL',
                stock: data.stock ? Number(data.stock) : 0,
                minStock: data.minStock ? Number(data.minStock) : 0,
                isActive: true,
            },
        });
    }
    async updateInsumo(insumoId, data) {
        return this.prisma.insumo.update({
            where: { id: insumoId },
            data: {
                name: data.name || undefined,
                unit: data.unit || undefined,
                costUnit: data.costUnit !== undefined ? Number(data.costUnit) : undefined,
                group: data.group || undefined,
                minStock: data.minStock !== undefined ? Number(data.minStock) : undefined,
                isActive: data.isActive !== undefined ? data.isActive : undefined,
            },
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
                        companyId, branchId: branch.id, cashAccountId: cuenta.id,
                        date: new Date(data.fecha), type: 'SALIDA', originType: 'COMPRA_INSUMO',
                        originId: data.insumoId, amount: total, currency: 'MXN',
                        exchangeRate: 1, amountMxn: total,
                        notes: `Compra: ${data.nombreInsumo} x ${cantidad} ${data.unidad}`,
                    },
                });
            }
        }
        return { success: true, total };
    }
    async cancelarCompra(companyId, compraId) {
        return this.prisma.purchase.update({
            where: { id: compraId, companyId },
            data: { paymentStatus: 'CANCELADO' },
        });
    }
    async getCompras(companyId, filters) {
        const where = { companyId };
        if (filters?.proveedorId)
            where.supplierId = filters.proveedorId;
        if (filters?.fechaIni || filters?.fechaFin) {
            where.date = {};
            if (filters.fechaIni)
                where.date.gte = new Date(filters.fechaIni);
            if (filters.fechaFin)
                where.date.lte = new Date(filters.fechaFin);
        }
        return this.prisma.purchase.findMany({
            where,
            include: { supplier: { select: { id: true, name: true } }, items: true },
            orderBy: { date: 'desc' },
        });
    }
    async crearCompra(companyId, userId, data) {
        const lineas = data.lineas || [];
        if (lineas.length === 0)
            throw new Error('Debe incluir al menos un insumo');
        const total = lineas.reduce((t, l) => t + Number(l.cantidad) * Number(l.costoUnitario), 0);
        const now = new Date();
        const prefix = `COM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        const count = await this.prisma.purchase.count({ where: { companyId } });
        const folio = `${prefix}-${String(count + 1).padStart(4, '0')}`;
        const compra = await this.prisma.purchase.create({
            data: {
                companyId,
                userId,
                supplierId: data.proveedorId || null,
                date: new Date(data.fecha),
                concept: `Compra ${folio} — ${lineas.length} insumo(s)`,
                total,
                totalMxn: total,
                paymentStatus: 'PAGADO',
                affectsInventory: true,
                invoiceRef: data.referencia || null,
                items: {
                    create: lineas.map((l) => ({
                        description: l.nombre || 'Insumo',
                        quantity: Number(l.cantidad),
                        unit: l.unidad || 'kg',
                        unitCost: Number(l.costoUnitario),
                        total: Number(l.cantidad) * Number(l.costoUnitario),
                    })),
                },
            },
            include: { supplier: { select: { id: true, name: true } }, items: true },
        });
        for (const l of lineas) {
            if (l.insumoId) {
                await this.prisma.insumo.update({
                    where: { id: l.insumoId },
                    data: { stock: { increment: Number(l.cantidad) }, costUnit: Number(l.costoUnitario) },
                });
            }
        }
        const branch = await this.prisma.branch.findFirst({ where: { companyId } });
        if (data.metodoPago !== 'CREDITO_CLIENTE' && branch) {
            const cuenta = await this.prisma.cashAccount.findFirst({
                where: { companyId, code: data.cuentaId || 'efectivo_mxn', isActive: true },
            });
            if (cuenta) {
                await this.prisma.flowMovement.create({
                    data: {
                        companyId, branchId: branch.id, cashAccountId: cuenta.id,
                        date: new Date(data.fecha), type: 'SALIDA', originType: 'COMPRA_INSUMO',
                        originId: compra.id, amount: total, currency: 'MXN',
                        exchangeRate: 1, amountMxn: total,
                        notes: `Compra ${folio}`,
                    },
                });
            }
        }
        return compra;
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
    _normalizarMetodo(method) {
        const map = {
            'efectivo': 'EFECTIVO', 'EFECTIVO_MXN': 'EFECTIVO', 'EFECTIVO_USD': 'EFECTIVO',
            'tarjeta': 'TARJETA_DEBITO', 'TARJETA': 'TARJETA_DEBITO', 'debito': 'TARJETA_DEBITO',
            'credito_card': 'TARJETA_CREDITO', 'TARJETA_CREDITO_CARD': 'TARJETA_CREDITO',
            'transferencia': 'TRANSFERENCIA', 'TRANSFERENCIA_BANCARIA': 'TRANSFERENCIA',
            'credito': 'CREDITO_CLIENTE', 'CREDITO': 'CREDITO_CLIENTE',
        };
        return map[method] || (method ? method.toUpperCase() : 'EFECTIVO');
    }
    async registerSale(companyId, data) {
        const total = data.lines.reduce((t, l) => t + l.quantity * l.unitPrice, 0);
        if (data.ocId) {
            for (const line of data.lines) {
                await this.prisma.productStock.updateMany({
                    where: { productId: line.productId },
                    data: { stock: { decrement: line.quantity } },
                });
            }
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
                    for (const lineaVenta of data.lines) {
                        const lineaOC = orden.lineas.find((l) => l.productId === lineaVenta.productId);
                        if (lineaOC) {
                            await this.prisma.lineaOC.update({
                                where: { id: lineaOC.id },
                                data: { cantidadSurtida: { increment: lineaVenta.quantity } },
                            });
                        }
                    }
                    await this.prisma.surtidoOC.create({
                        data: {
                            ordenCompraId: data.ocId,
                            fecha: new Date(data.date),
                            monto: total,
                            notes: `Entrega desde POS`,
                        },
                    });
                }
            }
            catch (e) {
                console.error('ERROR OC:', e.message);
            }
            return { success: true, isOCDelivery: true, total };
        }
        for (const line of data.lines) {
            const stock = await this.prisma.productStock.findFirst({
                where: { productId: line.productId },
            });
            const available = Number(stock?.stock || 0);
            if (available < Number(line.quantity)) {
                const product = await this.prisma.product.findUnique({ where: { id: line.productId } });
                throw new Error(`Stock insuficiente para "${product?.name || line.productId}". Disponible: ${available}, Solicitado: ${line.quantity}`);
            }
        }
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
                    paymentMethod: this._normalizarMetodo(data.paymentMethod || 'EFECTIVO'),
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
        if ((data.isCredit === true || data.isCredit === 'true' || data.paymentMethod === 'CREDITO_CLIENTE' || data.paymentMethod === 'credito') && data.clientId) {
            try {
                const saleDate = new Date(data.date);
                saleDate.setHours(0, 0, 0, 0);
                const dueDate = new Date(saleDate);
                dueDate.setDate(dueDate.getDate() + 30);
                await this.prisma.receivable.create({
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
            }
            catch (e) {
                console.error('ERROR CXC:', e.message);
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