import { CxcService } from './cxc.service';
export declare class CxcController {
    private svc;
    constructor(svc: CxcService);
    findAll(cid: string, period?: string, status?: string, clientId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    summary(cid: string, clientId?: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    addPayment(cid: string, receivableId: string, body: any): Promise<[{
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
