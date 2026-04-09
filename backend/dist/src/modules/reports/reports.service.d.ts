import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getIncomeStatement(companyId: string, period: string): Promise<{
        period: string;
        ventas: {
            bruta: number;
            descuentos: number;
            neta: number;
            cortes: number;
            total: number;
        };
        gastosPorSeccion: Record<string, any>;
        nomina: number;
        totalGastos: number;
        contribuciones: number;
        resultadoAntesContrib: number;
        resultadoEjercicio: number;
    }>;
    getConsolidado(period: string): Promise<{
        company: {
            id: string;
            name: string;
            code: string;
            color: string;
        };
        er: {
            period: string;
            ventas: {
                bruta: number;
                descuentos: number;
                neta: number;
                cortes: number;
                total: number;
            };
            gastosPorSeccion: Record<string, any>;
            nomina: number;
            totalGastos: number;
            contribuciones: number;
            resultadoAntesContrib: number;
            resultadoEjercicio: number;
        };
    }[]>;
}
