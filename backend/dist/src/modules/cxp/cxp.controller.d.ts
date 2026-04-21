import { CxpService } from './cxp.service';
export declare class CxpController {
    private svc;
    constructor(svc: CxpService);
    findAll(cid: string, period?: string, status?: string, supplierId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        supplier: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            companyId: string;
            email: string | null;
            phone: string | null;
            notes: string | null;
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
            payableId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        notes: string | null;
        status: string;
        date: Date;
        rubricId: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
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
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        notes: string | null;
        status: string;
        date: Date;
        rubricId: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        supplierId: string | null;
        concept: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    addPayment(id: string, body: any): Promise<[{
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
        payableId: string;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        notes: string | null;
        status: string;
        date: Date;
        rubricId: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        supplierId: string | null;
        concept: string;
    }]>;
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__PayableClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        notes: string | null;
        status: string;
        date: Date;
        rubricId: string | null;
        dueDate: Date | null;
        originalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        balance: import("@prisma/client/runtime/library").Decimal;
        supplierId: string | null;
        concept: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
