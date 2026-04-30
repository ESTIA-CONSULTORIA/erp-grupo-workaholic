import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CxcService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, period?: string, status?: string, clientId?: string, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            companyId: string;
            notes: string | null;
            createdAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            isActive: boolean;
            rfc: string | null;
            address: string | null;
            creditDays: number;
        };
        payments: {
            id: string;
            date: Date;
            currency: string;
            notes: string | null;
            createdAt: Date;
            receivableId: string;
            cashAccountId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: string;
            reference: string | null;
        }[];
    } & {
        id: string;
        companyId: string;
        clientId: string;
        cutLineId: string | null;
        rubricId: string | null;
        date: Date;
        dueDate: Date | null;
        currency: string;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getSummary(companyId: string, clientId?: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    addPayment(receivableId: string, cashAccountId: string, data: any): Promise<{
        id: string;
        date: Date;
        currency: string;
        notes: string | null;
        createdAt: Date;
        receivableId: string;
        cashAccountId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        reference: string | null;
    }>;
    cancelReceivable(id: string, motivo: string): Promise<{
        id: string;
        companyId: string;
        clientId: string;
        cutLineId: string | null;
        rubricId: string | null;
        date: Date;
        dueDate: Date | null;
        currency: string;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
