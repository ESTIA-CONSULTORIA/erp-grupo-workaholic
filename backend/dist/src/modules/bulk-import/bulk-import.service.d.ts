import { PrismaService } from '../../common/prisma/prisma.service';
export declare class BulkImportService {
    private prisma;
    constructor(prisma: PrismaService);
    private result;
    importGastos(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importProveedores(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importClientes(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importProductos(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importInsumos(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importEmpleados(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importCxC(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importCxP(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
    importCompras(companyId: string, rows: any[]): Promise<{
        ok: number;
        errors: string[];
    }>;
}
