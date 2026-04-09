import { ReportsService } from './reports.service';
export declare class ReportsController {
    private svc;
    constructor(svc: ReportsService);
    incomeStatement(cid: string, period: string): Promise<{
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
    consolidated(period: string): Promise<{
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
