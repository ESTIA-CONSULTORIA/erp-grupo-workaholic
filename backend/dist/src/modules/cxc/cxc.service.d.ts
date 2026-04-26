import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CxcService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, period?: string, status?: string, clientId?: string, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            companyId: string;
            createdAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            notes: string | null;
            isActive: boolean;
            creditLimit: import("@prisma/client/runtime/library").Decimal;
            rfc: string | null;
            address: string | null;
            creditDays: number;
        };
        payments: {
            id: string;
            cashAccountId: string | null;
            date: Date;
            currency: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: string;
            createdAt: Date;
            notes: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            reference: string | null;
            receivableId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        rubricId: string | null;
        date: Date;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        clientId: string;
        cutLineId: string | null;
    })[]>;
    getSummary(companyId: string, clientId?: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    addPayment(receivableId: string, cashAccountId: string, data: any): Promise<[{
        id: string;
        cashAccountId: string | null;
        date: Date;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        createdAt: Date;
        notes: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        reference: string | null;
        receivableId: string;
    }, {
        id: string;
        companyId: string;
        rubricId: string | null;
        date: Date;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        clientId: string;
        cutLineId: string | null;
    }]>;
    cancelReceivable(id: string, motivo: string): Promise<{
        id: string;
        companyId: string;
        rubricId: string | null;
        date: Date;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
        clientId: string;
        cutLineId: string | null;
    }>;
}
