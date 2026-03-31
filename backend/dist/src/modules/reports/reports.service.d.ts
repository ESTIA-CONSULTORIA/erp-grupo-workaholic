import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getIncomeStatement(companyId: string, period: string): Promise<{
        summary: {
            totalNetSale: number;
            totalCost: number;
            totalExpenses: number;
            grossProfit: number;
            grossMargin: number;
            operatingIncome: number;
            netIncome: number;
            netMargin: number;
        };
        sections: any[];
    }>;
    getConsolidated(period: string): Promise<{
        companies: {
            companyId: string;
            companyName: string;
            color: string;
            netSale: number;
            expenses: number;
            netIncome: number;
            cxcBalance: number;
        }[];
        groupTotal: {
            netSale: number;
            expenses: number;
            netIncome: number;
            cxcBalance: number;
        };
    }>;
}
