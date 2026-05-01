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
const bcrypt = require("bcryptjs");
let CompaniesService = class CompaniesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.company.findMany({
            where: { isActive: true },
            select: { id: true, name: true, code: true, color: true },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        return this.prisma.company.findUnique({
            where: { id },
            include: { branches: true },
        });
    }
    async getFinancialRubrics(companyId) {
        const schema = await this.prisma.financialSchema.findFirst({
            where: { companyId, isActive: true },
            include: {
                sections: {
                    include: {
                        groups: {
                            include: {
                                rubrics: {
                                    where: { isActive: true },
                                    orderBy: { order: 'asc' },
                                },
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        if (!schema)
            return [];
        const result = [];
        for (const section of schema.sections) {
            for (const group of section.groups) {
                for (const rubric of group.rubrics) {
                    result.push({
                        id: rubric.id,
                        code: rubric.code,
                        name: rubric.name,
                        groupName: group.name,
                        sectionName: section.name,
                        label: `${section.name} → ${group.name} → ${rubric.name}`,
                    });
                }
            }
        }
        return result;
    }
    getCashAccounts(companyId) {
        return this.prisma.cashAccount.findMany({
            where: { companyId, isActive: true },
            orderBy: { name: 'asc' },
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
    async createUser(companyId, data) {
        const passwordHash = await bcrypt.hash(data.password, 10);
        let role = await this.prisma.role.findUnique({ where: { code: data.roleCode } });
        if (!role) {
            role = await this.prisma.role.create({
                data: { code: data.roleCode, name: data.roleCode, description: data.roleCode },
            });
        }
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                isActive: true,
            },
        });
        const companyIds = data.companyIds || [companyId];
        for (const cid of companyIds) {
            await this.prisma.userCompanyRole.create({
                data: { userId: user.id, companyId: cid, roleId: role.id },
            });
        }
        return user;
    }
    async updateUser(userId, data) {
        const updateData = {
            name: data.name,
        };
        if (data.password && data.password.trim() !== '') {
            updateData.passwordHash = await bcrypt.hash(data.password, 10);
        }
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        if (data.roleCode) {
            let role = await this.prisma.role.findUnique({ where: { code: data.roleCode } });
            if (!role) {
                role = await this.prisma.role.create({
                    data: { code: data.roleCode, name: data.roleCode, description: data.roleCode },
                });
            }
            const userRoles = await this.prisma.userCompanyRole.findMany({ where: { userId } });
            for (const ur of userRoles) {
                await this.prisma.userCompanyRole.update({
                    where: { id: ur.id },
                    data: { roleId: role.id },
                });
            }
        }
        return user;
    }
    async toggleUser(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('Usuario no encontrado');
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: !user.isActive },
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
    async getOrdenes(companyId, clientId, status) {
        const where = { companyId };
        if (clientId)
            where.clientId = clientId;
        if (status === 'ACTIVAS') {
            where.status = { in: ['PENDIENTE', 'SURTIDO_PARCIAL'] };
        }
        else if (status) {
            where.status = status;
        }
        return this.prisma.ordenCompra.findMany({
            where,
            include: {
                client: { select: { id: true, name: true } },
                lineas: { include: { product: true } },
                surtidos: true,
            },
            orderBy: { fecha: 'desc' },
        });
    }
    async createOrdenCompra(companyId, clientId, data) {
        const montoTotal = data.lineas
            ? data.lineas.reduce((t, l) => t + (l.cantidad * l.precioUnitario), 0)
            : Number(data.montoTotal || 0);
        const oc = await this.prisma.ordenCompra.create({
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
        if (montoTotal > 0) {
            try {
                const fecha = new Date(data.fecha);
                fecha.setHours(0, 0, 0, 0);
                const dueDate = new Date(fecha);
                dueDate.setDate(dueDate.getDate() + 30);
                await this.prisma.sale.create({
                    data: {
                        companyId,
                        clientId,
                        date: fecha,
                        channel: data.canal || 'MOSTRADOR',
                        isCredit: true,
                        total: montoTotal,
                        paymentMethod: 'CREDITO_CLIENTE',
                        lines: oc.lineas ? {
                            create: oc.lineas.map((l) => ({
                                productId: l.productId,
                                quantity: l.cantidad,
                                unitPrice: l.precioUnitario,
                                total: l.total,
                            })),
                        } : undefined,
                    },
                });
                await this.prisma.receivable.create({
                    data: {
                        companyId,
                        clientId,
                        date: fecha,
                        dueDate,
                        originalAmount: montoTotal,
                        paidAmount: 0,
                        balance: montoTotal,
                        currency: 'MXN',
                        status: 'PENDIENTE',
                        notes: `OC #${data.numero}`,
                    },
                });
            }
            catch (e) {
                console.error('ERROR OC Sale/CXC:', e.message);
            }
        }
        return oc;
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
        if (data.lineas && data.lineas.length > 0) {
            for (const ls of data.lineas) {
                const linea = orden.lineas.find((l) => l.id === ls.lineaId);
                if (!linea)
                    continue;
                await this.prisma.productStock.updateMany({
                    where: { productId: linea.productId },
                    data: { stock: { decrement: Number(ls.cantidad) } },
                }).catch(() => { });
            }
        }
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