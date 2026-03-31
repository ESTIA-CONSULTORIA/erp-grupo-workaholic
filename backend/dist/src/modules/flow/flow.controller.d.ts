import { FlowService } from './flow.service';
export declare class FlowController {
    private svc;
    constructor(svc: FlowService);
    getBalances(id: string): Promise<{
        accounts: {
            accountId: string;
            accountCode: string;
            accountName: string;
            type: string;
            currency: string;
            bankName: string;
            balance: number;
        }[];
        totalMxn: number;
        totalUsd: number;
    }>;
    transfer(id: string, body: any): Promise<[{
        id: string;
        createdAt: Date;
        companyId: string;
        type: string;
        currency: string;
        amountMxn: import("@prisma/client/runtime/library").Decimal;
        amount: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        branchId: string;
        cashAccountId: string;
        date: Date;
        originType: string;
        originId: string | null;
        rubricId: string | null;
        reference: string | null;
        notes: string | null;
    }, {
        id: string;
        createdAt: Date;
        companyId: string;
        type: string;
        currency: string;
        amountMxn: import("@prisma/client/runtime/library").Decimal;
        amount: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        branchId: string;
        cashAccountId: string;
        date: Date;
        originType: string;
        originId: string | null;
        rubricId: string | null;
        reference: string | null;
        notes: string | null;
    }]>;
}
