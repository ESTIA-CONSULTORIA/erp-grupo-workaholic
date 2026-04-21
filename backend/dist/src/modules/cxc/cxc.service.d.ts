import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CxcService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, period?: string, status?: string, clientId?: string, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            companyId: string;
            email: string | null;
            phone: string | null;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            rfc: string | null;
            address: string | null;
            creditDays: number;
        };
        payments: {
            id: string;
            createdAt: Date;
            currency: string;
            notes: string | null;
            date: Date;
            paymentMethod: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            cashAccountId: string | null;
            reference: string | null;
            receivableId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        notes: string | null;
        clientId: string;
        status: string;
        date: Date;
        cutLineId: string | null;
        rubricId: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    getSummary(companyId: string, clientId?: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    addPayment(receivableId: string, cashAccountId: string, data: any): Promise<[{
        id: string;
        createdAt: Date;
        currency: string;
        notes: string | null;
        date: Date;
        paymentMethod: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        cashAccountId: string | null;
        reference: string | null;
        receivableId: string;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        notes: string | null;
        clientId: string;
        status: string;
        date: Date;
        cutLineId: string | null;
        rubricId: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
    }]>;
}
