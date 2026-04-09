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
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CompaniesService = class CompaniesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.company.findMany({ orderBy: { name: 'asc' } });
    }
    findOne(id) {
        return this.prisma.company.findUnique({
            where: { id },
            include: { branches: true },
        });
    }
    getUsers(companyId) {
        return this.prisma.userCompanyRole.findMany({
            where: { companyId },
            include: {
                user: { select: { id: true, name: true, email: true, isActive: true } },
                role: true,
            },
        });
    }
    getClients(companyId) {
        return this.prisma.client.findMany({
            where: { companyId, isActive: true },
            include: { _count: { select: { ordenesCompra: true } } },
            orderBy: { name: 'asc' },
        });
    }
    createClient(companyId, data) {
        return this.prisma.client.create({
            data: {
                companyId,
                name: data.name,
                rfc: data.rfc || null,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                creditLimit: data.creditLimit || 0,
                creditDays: data.creditDays || 0,
                isActive: true,
            },
        });
    }
    updateClient(clientId, data) {
        return this.prisma.client.update({
            where: { id: clientId },
            data: {
                name: data.name,
                rfc: data.rfc || null,
                phone: data.phone || null,
                email: data.email || null,
                address: data.address || null,
                creditLimit: data.creditLimit || 0,
                creditDays: data.creditDays || 0,
            },
        });
    }
    getClientDetail(clientId) {
        return this.prisma.client.findUnique({
            where: { id: clientId },
            include: {
                ordenesCompra: {
                    include: {
                        lineas: { include: { product: true } },
                        surtidos: true,
                    },
                    orderBy: { fecha: 'desc' },
                },
                receivables: {
                    where: { status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
                    orderBy: { date: 'desc' },
                },
            },
        });
    }
    async createOrdenCompra(companyId, clientId, data) {
        const montoTotal = data.lineas
            ? data.lineas.reduce((t, l) => t + (l.cantidad * l.precioUnitario), 0)
            : Number(data.montoTotal || 0);
        return this.prisma.ordenCompra.create({
            data: {
                companyId,
                clientId,
                numero: data.numero,
                fecha: new Date(data.fecha),
                montoTotal,
                saldo: montoTotal,
                status: 'PENDIENTE',
                notes: data.notes || null,
                lineas: data.lineas ? {
                    create: data.lineas.map((l) => ({
                        productId: l.productId,
                        cantidad: l.cantidad,
                        precioUnitario: l.precioUnitario,
                        total: l.cantidad * l.precioUnitario,
                    })),
                } : undefined,
            },
            include: { lineas: { include: { product: true } } },
        });
    }
    async registrarSurtido(ordenId, data) {
        const orden = await this.prisma.ordenCompra.findUnique({
            where: { id: ordenId },
            include: { lineas: true },
        });
        if (!orden)
            throw new Error('OC no encontrada');
        if (orden.status === 'CANCELADA')
            throw new Error('No se puede surtir una OC cancelada');
        let montoSurtido = 0;
        if (data.lineas && data.lineas.length > 0) {
            for (const ls of data.lineas) {
                const linea = orden.lineas.find((l) => l.id === ls.lineaId);
                if (!linea)
                    continue;
                const nuevaCantSurtida = Number(linea.cantidadSurtida) + Number(ls.cantidad);
                await this.prisma.lineaOC.update({
                    where: { id: ls.lineaId },
                    data: { cantidadSurtida: nuevaCantSurtida },
                });
                montoSurtido += Number(ls.cantidad) * Number(linea.precioUnitario);
            }
        }
        else {
            montoSurtido = Number(data.monto || 0);
        }
        const nuevoMontoSurtido = Number(orden.montoSurtido) + montoSurtido;
        const nuevoSaldo = Number(orden.montoTotal) - nuevoMontoSurtido;
        const nuevoStatus = nuevoSaldo <= 0 ? 'SURTIDO_COMPLETO' : 'SURTIDO_PARCIAL';
        return this.prisma.$transaction([
            this.prisma.surtidoOC.create({
                data: {
                    ordenCompraId: ordenId,
                    fecha: new Date(data.fecha),
                    monto: montoSurtido,
                    notes: data.notes || null,
                },
            }),
            this.prisma.ordenCompra.update({
                where: { id: ordenId },
                data: { montoSurtido: nuevoMontoSurtido, saldo: nuevoSaldo, status: nuevoStatus },
            }),
        ]);
    }
    async cancelarOC(ordenId, motivo) {
        return this.prisma.ordenCompra.update({
            where: { id: ordenId },
            data: { status: 'CANCELADA', notes: motivo },
        });
    }
    async cerrarOCParcial(ordenId) {
        const orden = await this.prisma.ordenCompra.findUnique({ where: { id: ordenId } });
        if (!orden)
            throw new Error('OC no encontrada');
        return this.prisma.ordenCompra.update({
            where: { id: ordenId },
            data: { status: 'SURTIDO_COMPLETO' },
        });
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map