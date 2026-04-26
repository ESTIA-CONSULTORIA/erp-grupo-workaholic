import { LoncheService } from './lonche.service';
export declare class LoncheController {
    private svc;
    constructor(svc: LoncheService);
    dashboard(cid: string): Promise<{
        turnoActivo: boolean;
        ventasHoy: number;
        ticketsHoy: any;
        cashbackHoy: number;
        students: any;
        saldoTotal: number;
        cashbackTotal: number;
    }>;
    getProducts(cid: string): any;
    createProduct(cid: string, body: any): any;
    updateProduct(id: string, body: any): any;
    getTurnos(cid: string): Promise<any>;
    getTurnoActivo(cid: string): Promise<any>;
    abrirTurno(cid: string, req: any, body: any): Promise<any>;
    cerrarTurno(id: string, body: any): Promise<any>;
    reabrirTurno(cid: string, id: string, req: any, body: any): Promise<any>;
    validarTurno(id: string, req: any): Promise<any>;
    crearSurtido(cid: string, turnoId: string, req: any, body: any): Promise<any>;
    registrarVenta(cid: string, turnoId: string, body: any): Promise<any>;
    getStudents(cid: string, search: string): any;
    findByCode(cid: string, code: string): any;
    createStudent(cid: string, body: any): any;
    updateStudent(id: string, body: any): any;
    recargar(cid: string, id: string, req: any, body: any): Promise<any>;
    getTransactions(cid: string, id: string): any;
    reporteCooperativa(cid: string, desde: string, hasta: string): Promise<{
        periodo: {
            desde: string;
            hasta: string;
        };
        resumen: {
            totalVentas: any;
            totalPrepago: any;
            totalEfectivo: any;
            totalCashback: any;
            totalRecargas: any;
        };
        turnos: any;
        porProducto: {
            name: string;
            qty: number;
            total: number;
        }[];
    }>;
    reporteTutor(cid: string, sid: string, desde: string, hasta: string): Promise<{
        student: any;
        transactions: any;
        sales: any;
    }>;
}
