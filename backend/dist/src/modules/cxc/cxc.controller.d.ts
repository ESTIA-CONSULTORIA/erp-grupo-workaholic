import { CxcService } from './cxc.service';
export declare class CxcController {
    private svc;
    constructor(svc: CxcService);
    findAll(cid: string, period?: string, status?: string, clientId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    summary(cid: string, clientId?: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    addPayment(cid: string, receivableId: string, body: any): Promise<{
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
    cancel(id: string, body: {
        motivo: string;
    }): Promise<{
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
