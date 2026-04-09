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
exports.CorteCajaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CorteCajaService = class CorteCajaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCortes(companyId, status) {
        const where = { companyId };
        if (status)
            where.status = status;
        return this.prisma.corteCaja.findMany({
            where,
            include: {
                cajero: { select: { id: true, name: true } },
                validador: { select: { id: true, name: true } },
            },
            orderBy: { fecha: 'desc' },
        });
    }
    async crearCorte(companyId, cajeroId, data) {
        const fecha = new Date(data.fecha);
        fecha.setHours(0, 0, 0, 0);
        const diferencia = Number(data.efectivoContado) - Number(data.totalEfectivo);
        return this.prisma.corteCaja.create({
            data: {
                companyId,
                cajeroId,
                fecha,
                status: 'PENDIENTE',
                totalVentas: data.totalVentas || 0,
                totalEfectivo: data.totalEfectivo || 0,
                totalTarjeta: data.totalTarjeta || 0,
                totalTransfer: data.totalTransfer || 0,
                totalCredito: data.totalCredito || 0,
                efectivoContado: data.efectivoContado || 0,
                diferencia,
                notasCajero: data.notasCajero || null,
                detalleVentas: data.detalleVentas || null,
            },
            include: { cajero: { select: { id: true, name: true } } },
        });
    }
    async validarCorte(corteId, validadorId, data) {
        const corte = await this.prisma.corteCaja.findUnique({ where: { id: corteId } });
        if (!corte)
            throw new Error('Corte no encontrado');
        const efectivoFinal = data.efectivoReal !== undefined ? Number(data.efectivoReal) : Number(corte.efectivoContado);
        const diferencia = efectivoFinal - Number(corte.totalEfectivo);
        const updatedCorte = await this.prisma.corteCaja.update({
            where: { id: corteId },
            data: {
                status: 'VALIDADO',
                efectivoReal: efectivoFinal,
                diferencia,
                notasValidador: data.notasValidador || null,
                validadoPor: validadorId,
                validadoAt: new Date(),
            },
        });
        const branch = await this.prisma.branch.findFirst({ where: { companyId: corte.companyId } });
        const cajaCuenta = await this.prisma.cashAccount.findFirst({
            where: { companyId: corte.companyId, type: 'EFECTIVO', isActive: true },
        });
        if (cajaCuenta && efectivoFinal > 0) {
            await this.prisma.flowMovement.create({
                data: {
                    companyId: corte.companyId,
                    branchId: branch.id,
                    cashAccountId: cajaCuenta.id,
                    date: corte.fecha,
                    type: 'ENTRADA',
                    originType: 'CORTE',
                    originId: corteId,
                    amount: efectivoFinal,
                    currency: 'MXN',
                    exchangeRate: 1,
                    amountMxn: efectivoFinal,
                    notes: `Corte de caja ${corte.fecha.toISOString().slice(0, 10)}`,
                },
            });
        }
        const bancoCuenta = await this.prisma.cashAccount.findFirst({
            where: { companyId: corte.companyId, type: 'BANCO', isActive: true },
        });
        const totalBanco = Number(corte.totalTarjeta) + Number(corte.totalTransfer);
        if (bancoCuenta && totalBanco > 0) {
            await this.prisma.flowMovement.create({
                data: {
                    companyId: corte.companyId,
                    branchId: branch.id,
                    cashAccountId: bancoCuenta.id,
                    date: corte.fecha,
                    type: 'ENTRADA',
                    originType: 'CORTE',
                    originId: corteId,
                    amount: totalBanco,
                    currency: 'MXN',
                    exchangeRate: 1,
                    amountMxn: totalBanco,
                    notes: `Tarjeta/Transferencia corte ${corte.fecha.toISOString().slice(0, 10)}`,
                },
            });
        }
        return updatedCorte;
    }
    async rechazarCorte(corteId, validadorId, notas) {
        return this.prisma.corteCaja.update({
            where: { id: corteId },
            data: {
                status: 'RECHAZADO',
                notasValidador: notas,
                validadoPor: validadorId,
                validadoAt: new Date(),
            },
        });
    }
};
exports.CorteCajaService = CorteCajaService;
exports.CorteCajaService = CorteCajaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CorteCajaService);
//# sourceMappingURL=corte-caja.service.js.map