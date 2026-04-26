import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, period?: string, isExternal?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
        rubric: {
            group: {
                section: {
                    name: string;
                };
            } & {
                id: string;
                code: string;
                name: string;
                order: number;
                sectionId: string;
                isSummary: boolean;
            };
        } & {
            id: string;
            code: string;
            name: string;
            order: number;
            affectsResult: boolean;
            isActive: boolean;
            groupId: string;
            rubricType: string;
            allowsContado: boolean;
            allowsCxC: boolean;
            allowsDiscount: boolean;
            allowsCourtesy: boolean;
            requiresClient: boolean;
            requiresSupplier: boolean;
            requiresBank: boolean;
            requiresTerminal: boolean;
            affectsGrossSale: boolean;
            affectsNetSale: boolean;
            affectsFlow: boolean;
            affectsCxC: boolean;
            affectsCxP: boolean;
            affectsCost: boolean;
            affectsExpense: boolean;
            affectsExternalOp: boolean;
            showInSummary: boolean;
            showInStatement: boolean;
            showInDashboard: boolean;
        };
    } & {
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        cashAccountId: string | null;
        userId: string;
        date: Date;
        concept: string;
        description: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        paymentMethod: string | null;
        invoiceRef: string | null;
        isExternal: boolean;
        externalNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(companyId: string, userId: string, data: any): Promise<{
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
        rubric: {
            group: {
                section: {
                    name: string;
                };
            } & {
                id: string;
                code: string;
                name: string;
                order: number;
                sectionId: string;
                isSummary: boolean;
            };
        } & {
            id: string;
            code: string;
            name: string;
            order: number;
            affectsResult: boolean;
            isActive: boolean;
            groupId: string;
            rubricType: string;
            allowsContado: boolean;
            allowsCxC: boolean;
            allowsDiscount: boolean;
            allowsCourtesy: boolean;
            requiresClient: boolean;
            requiresSupplier: boolean;
            requiresBank: boolean;
            requiresTerminal: boolean;
            affectsGrossSale: boolean;
            affectsNetSale: boolean;
            affectsFlow: boolean;
            affectsCxC: boolean;
            affectsCxP: boolean;
            affectsCost: boolean;
            affectsExpense: boolean;
            affectsExternalOp: boolean;
            showInSummary: boolean;
            showInStatement: boolean;
            showInDashboard: boolean;
        };
    } & {
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        cashAccountId: string | null;
        userId: string;
        date: Date;
        concept: string;
        description: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        paymentMethod: string | null;
        invoiceRef: string | null;
        isExternal: boolean;
        externalNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): import(".prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        cashAccountId: string | null;
        userId: string;
        date: Date;
        concept: string;
        description: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        paymentMethod: string | null;
        invoiceRef: string | null;
        isExternal: boolean;
        externalNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    delete(id: string): import(".prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        companyId: string;
        supplierId: string | null;
        rubricId: string | null;
        cashAccountId: string | null;
        userId: string;
        date: Date;
        concept: string;
        description: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        paymentMethod: string | null;
        invoiceRef: string | null;
        isExternal: boolean;
        externalNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
