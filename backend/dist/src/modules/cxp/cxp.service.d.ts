import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CxpService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, period?: string, status?: string, supplierId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    getSummary(companyId: string): Promise<{
        totalPending: number;
        totalOverdue: number;
        pendingCount: number;
    }>;
    create(companyId: string, data: any): import(".prisma/client").Prisma.Prisma__PayableClient<{
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
    addPayment(payableId: string, data: any): Promise<{
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
    update(id: string, data: any): import(".prisma/client").Prisma.Prisma__PayableClient<{
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
    cancelPayable(id: string, motivo: string): Promise<{
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
