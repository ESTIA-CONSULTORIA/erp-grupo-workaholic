import { PrismaService } from '../../common/prisma/prisma.service';
export declare class FlowService {
    private prisma;
    constructor(prisma: PrismaService);
    getBalances(companyId: string): Promise<{
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
    transfer(companyId: string, data: any): Promise<[{
        id: string;
        createdAt: Date;
        companyId: string;
        type: string;
        currency: string;
        notes: string | null;
        date: Date;
        rubricId: string | null;
        originType: string;
        originId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountMxn: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        branchId: string;
        cashAccountId: string;
    }, {
        id: string;
        createdAt: Date;
        companyId: string;
        type: string;
        currency: string;
        notes: string | null;
        date: Date;
        rubricId: string | null;
        originType: string;
        originId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        amountMxn: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        branchId: string;
        cashAccountId: string;
    }]>;
}
