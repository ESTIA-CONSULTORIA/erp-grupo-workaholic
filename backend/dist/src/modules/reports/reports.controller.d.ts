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
        costoVentas: number;
        utilidadBruta: number;
        gastosPorSeccion: Record<string, any>;
        nomina: number;
        totalGastos: number;
        contribuciones: number;
        resultadoAntesContrib: number;
        resultadoEjercicio: number;
    }>;
    cashFlow(cid: string, period: string): Promise<{
        period: string;
        saldoInicial: number;
        operativos: any;
        financieros: any;
        variacionNeta: any;
        saldoFinal: any;
        saldosPorCuenta: {
            cuenta: string;
            tipo: string;
            moneda: string;
            saldo: number;
        }[];
        movimientos: {
            fecha: Date;
            tipo: string;
            origen: string;
            monto: number;
            cuenta: any;
            notas: string;
        }[];
    }>;
    balanceSheet(cid: string, period: string): Promise<{
        period: string;
        activos: {
            efectivoYBancos: {
                nombre: string;
                tipo: string;
                saldo: number;
            }[];
            totalEfectivo: number;
            cuentasPorCobrar: number;
            inventario: number;
            total: number;
        };
        pasivos: {
            cuentasPorPagar: number;
            total: number;
        };
        patrimonio: {
            resultadoPeriodo: number;
            total: number;
        };
    }>;
    dashboard(cid: string, period: string): Promise<{
        period: string;
        ventas: number;
        resultado: number;
        totalGastos: number;
        costoVentas: number;
        utilidadBruta: number;
        cxcPendiente: number;
        cxpPendiente: number;
        cortesPendientes: number;
        ventasMeses: any[];
        topProductos: {
            sku: string;
            name: string;
            qty: number;
            total: number;
        }[];
    }>;
    consolidated(period: string): Promise<{
        companies: {
            companyId: string;
            companyName: string;
            companyCode: string;
            color: string;
            netSale: number;
            expenses: number;
            cxcBalance: number;
            netIncome: number;
        }[];
        groupTotal: {
            netSale: number;
            expenses: number;
            cxcBalance: number;
            netIncome: number;
        };
    }>;
    fixOCSales(cid: string): Promise<{
        total: number;
        created: number;
        errors: string[];
    }>;
}
