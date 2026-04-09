import { CorteCajaService } from './corte-caja.service';
export declare class CorteCajaController {
    private svc;
    constructor(svc: CorteCajaService);
    getCortes(cid: string, status?: string): Promise<({
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
    crearCorte(cid: string, body: any, req: any): Promise<{
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
    validarCorte(id: string, body: any, req: any): Promise<{
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
    rechazarCorte(id: string, body: any, req: any): Promise<{
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
