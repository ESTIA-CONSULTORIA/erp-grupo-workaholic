import { CxpService } from './cxp.service';
export declare class CxpController {
    private svc;
    constructor(svc: CxpService);
    findAll(cid: string, period?: string, status?: string, supplierId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        payments: {
            id: string;
            date: Date;
            currency: string;
            notes: string | null;
            createdAt: Date;
            cashAccountId: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            exchangeRate: import("@prisma/client/runtime/library").Decimal;
            paymentMethod: string;
            reference: string | null;
            payableId: string;
        }[];
        supplier: {
            id: string;
            companyId: string;
            notes: string | null;
            createdAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        companyId: string;
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
        supplierId: string | null;
        concept: string;
    })[]>;
    summary(cid: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    create(cid: string, body: any): import(".prisma/client").Prisma.Prisma__PayableClient<{
        id: string;
        companyId: string;
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
        supplierId: string | null;
        concept: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    addPayment(id: string, body: any): Promise<{
        id: string;
        date: Date;
        currency: string;
        notes: string | null;
        createdAt: Date;
        cashAccountId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        reference: string | null;
        payableId: string;
    }>;
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__PayableClient<{
        id: string;
        companyId: string;
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
        supplierId: string | null;
        concept: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    cancel(id: string, body: {
        motivo: string;
    }): Promise<{
        id: string;
        companyId: string;
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
        supplierId: string | null;
        concept: string;
    }>;
}
