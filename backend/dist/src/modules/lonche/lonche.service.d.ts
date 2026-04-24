import { PrismaService } from '../../common/prisma/prisma.service';
export declare class LoncheService {
    private prisma;
    constructor(prisma: PrismaService);
    getProducts(companyId: string): any;
    createProduct(companyId: string, data: any): any;
    updateProduct(id: string, data: any): any;
    getTurnos(companyId: string): Promise<any>;
    getTurnoActivo(companyId: string): Promise<any>;
    abrirTurno(companyId: string, userId: string, cajeroName: string): Promise<any>;
    cerrarTurno(turnoId: string, data: any): Promise<any>;
    validarTurno(turnoId: string, userId: string): Promise<any>;
    crearSurtido(turnoId: string, companyId: string, userId: string, items: any[], type?: string): Promise<any>;
    registrarVenta(companyId: string, turnoId: string, data: any): Promise<any>;
    getStudents(companyId: string, search?: string): any;
    findStudentByCode(companyId: string, code: string): any;
    createStudent(companyId: string, data: any): any;
    updateStudent(id: string, data: any): any;
    recargar(companyId: string, studentId: string, data: any): Promise<any>;
    getTransactions(companyId: string, studentId: string): any;
    getReporteCooperativa(companyId: string, desde: string, hasta: string): Promise<{
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
    getReporteTutor(companyId: string, studentId: string, desde: string, hasta: string): Promise<{
        student: any;
        transactions: any;
        sales: any;
    }>;
    getDashboard(companyId: string): Promise<{
        turnoActivo: boolean;
        ventasHoy: number;
        ticketsHoy: any;
        cashbackHoy: number;
        students: any;
        saldoTotal: number;
        cashbackTotal: number;
    }>;
}
