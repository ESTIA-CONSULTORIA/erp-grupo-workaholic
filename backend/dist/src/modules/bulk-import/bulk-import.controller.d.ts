import { BulkImportService } from './bulk-import.service';
export declare class BulkImportController {
    private readonly svc;
    constructor(svc: BulkImportService);
    importGastos(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importProveedores(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importClientes(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importProductos(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importInsumos(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importEmpleados(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importCxC(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importCxP(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
    importCompras(cid: string, body: {
        rows: any[];
    }): Promise<{
        ok: number;
        errors: string[];
    }>;
}
