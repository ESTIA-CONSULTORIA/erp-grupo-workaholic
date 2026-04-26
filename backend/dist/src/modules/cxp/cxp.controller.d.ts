import { CxpService } from './cxp.service';
export declare class CxpController {
    private svc;
    constructor(svc: CxpService);
    findAll(cid: string, period?: string, status?: string, supplierId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        supplier: {
            id: string;
            companyId: string;
            createdAt: Date;
            name: string;
            email: string | null;
            phone: string | null;
            notes: string | null;
            isActive: boolean;
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
            payableId: string;
        }[];
    } & {
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        date: Date;
        concept: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
    })[]>;
    summary(cid: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    create(cid: string, body: any): import(".prisma/client").Prisma.Prisma__PayableClient<{
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        date: Date;
        concept: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    addPayment(id: string, body: any): Promise<[{
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
        payableId: string;
    }, {
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        date: Date;
        concept: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }]>;
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__PayableClient<{
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        date: Date;
        concept: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    cancel(id: string, body: {
        motivo: string;
    }): Promise<{
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        date: Date;
        concept: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
}
