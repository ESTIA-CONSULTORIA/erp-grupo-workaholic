import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CxcService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, period?: string, status?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            companyId: string;
            email: string | null;
            phone: string | null;
            notes: string | null;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
        };
        payments: {
            id: string;
            createdAt: Date;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            cashAccountId: string | null;
            date: Date;
            reference: string | null;
            paymentMethod: string;
            cxcId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        notes: string | null;
        status: string;
        clientId: string | null;
        concept: string;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getSummary(companyId: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    addPayment(cxcId: string, cashAccountId: string, data: any): Promise<[{
        id: string;
        createdAt: Date;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        cashAccountId: string | null;
        date: Date;
        reference: string | null;
        paymentMethod: string;
        cxcId: string;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        date: Date;
        notes: string | null;
        status: string;
        clientId: string | null;
        concept: string;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
    }]>;
}
