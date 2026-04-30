type FlowType = 'ENTRADA' | 'SALIDA';
interface FlowOpts {
    type: FlowType;
    originType: string;
    originId?: string;
    amount: number;
    paymentMethod?: string;
    currency?: string;
    exchangeRate?: number;
    date?: Date;
    notes?: string;
}
export declare function registrarFlujo(prisma: any, companyId: string, opts: FlowOpts): Promise<any>;
export {};
