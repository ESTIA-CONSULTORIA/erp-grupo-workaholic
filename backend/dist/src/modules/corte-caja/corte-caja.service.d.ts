import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CorteCajaService {
    private prisma;
    constructor(prisma: PrismaService);
    getCortes(companyId: string, status?: string): Promise<({
        cajero: {
            id: string;
            name: string;
        };
        validador: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        branchId: string | null;
        cajeroId: string;
        totalVentas: import("@prisma/client/runtime/library").Decimal;
        totalEfectivo: import("@prisma/client/runtime/library").Decimal;
        totalTarjeta: import("@prisma/client/runtime/library").Decimal;
        totalTransfer: import("@prisma/client/runtime/library").Decimal;
        totalCredito: import("@prisma/client/runtime/library").Decimal;
        efectivoContado: import("@prisma/client/runtime/library").Decimal;
        efectivoReal: import("@prisma/client/runtime/library").Decimal | null;
        diferencia: import("@prisma/client/runtime/library").Decimal;
        notasCajero: string | null;
        notasValidador: string | null;
        validadoPor: string | null;
        validadoAt: Date | null;
        detalleVentas: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    crearCorte(companyId: string, cajeroId: string, data: any): Promise<{
        cajero: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        branchId: string | null;
        cajeroId: string;
        totalVentas: import("@prisma/client/runtime/library").Decimal;
        totalEfectivo: import("@prisma/client/runtime/library").Decimal;
        totalTarjeta: import("@prisma/client/runtime/library").Decimal;
        totalTransfer: import("@prisma/client/runtime/library").Decimal;
        totalCredito: import("@prisma/client/runtime/library").Decimal;
        efectivoContado: import("@prisma/client/runtime/library").Decimal;
        efectivoReal: import("@prisma/client/runtime/library").Decimal | null;
        diferencia: import("@prisma/client/runtime/library").Decimal;
        notasCajero: string | null;
        notasValidador: string | null;
        validadoPor: string | null;
        validadoAt: Date | null;
        detalleVentas: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    validarCorte(corteId: string, validadorId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        branchId: string | null;
        cajeroId: string;
        totalVentas: import("@prisma/client/runtime/library").Decimal;
        totalEfectivo: import("@prisma/client/runtime/library").Decimal;
        totalTarjeta: import("@prisma/client/runtime/library").Decimal;
        totalTransfer: import("@prisma/client/runtime/library").Decimal;
        totalCredito: import("@prisma/client/runtime/library").Decimal;
        efectivoContado: import("@prisma/client/runtime/library").Decimal;
        efectivoReal: import("@prisma/client/runtime/library").Decimal | null;
        diferencia: import("@prisma/client/runtime/library").Decimal;
        notasCajero: string | null;
        notasValidador: string | null;
        validadoPor: string | null;
        validadoAt: Date | null;
        detalleVentas: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    rechazarCorte(corteId: string, validadorId: string, notas: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        branchId: string | null;
        cajeroId: string;
        totalVentas: import("@prisma/client/runtime/library").Decimal;
        totalEfectivo: import("@prisma/client/runtime/library").Decimal;
        totalTarjeta: import("@prisma/client/runtime/library").Decimal;
        totalTransfer: import("@prisma/client/runtime/library").Decimal;
        totalCredito: import("@prisma/client/runtime/library").Decimal;
        efectivoContado: import("@prisma/client/runtime/library").Decimal;
        efectivoReal: import("@prisma/client/runtime/library").Decimal | null;
        diferencia: import("@prisma/client/runtime/library").Decimal;
        notasCajero: string | null;
        notasValidador: string | null;
        validadoPor: string | null;
        validadoAt: Date | null;
        detalleVentas: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
