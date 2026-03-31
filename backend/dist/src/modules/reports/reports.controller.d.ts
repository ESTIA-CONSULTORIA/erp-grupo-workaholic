import { ReportsService } from './reports.service';
export declare class ReportsController {
    private svc;
    constructor(svc: ReportsService);
    incomeStatement(cid: string, period: string): Promise<{
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
    consolidated(period: string): Promise<{
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
