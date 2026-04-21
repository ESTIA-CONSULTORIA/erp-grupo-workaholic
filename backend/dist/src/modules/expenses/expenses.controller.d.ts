import { ExpensesService } from './expenses.service';
export declare class ExpensesController {
    private svc;
    constructor(svc: ExpensesService);
    findAll(cid: string, period?: string, isExternal?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
            isActive: boolean;
            order: number;
            affectsResult: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        description: string | null;
        userId: string;
        date: Date;
        rubricId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        cashAccountId: string | null;
        supplierId: string | null;
        concept: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        invoiceRef: string | null;
        isExternal: boolean;
        externalNotes: string | null;
    })[]>;
    create(cid: string, req: any, body: any): Promise<{
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
            isActive: boolean;
            order: number;
            affectsResult: boolean;
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
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        description: string | null;
        userId: string;
        date: Date;
        rubricId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        cashAccountId: string | null;
        supplierId: string | null;
        concept: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        invoiceRef: string | null;
        isExternal: boolean;
        externalNotes: string | null;
    }>;
    delete(id: string): import(".prisma/client").Prisma.Prisma__ExpenseClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        currency: string;
        description: string | null;
        userId: string;
        date: Date;
        rubricId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        cashAccountId: string | null;
        supplierId: string | null;
        concept: string;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        invoiceRef: string | null;
        isExternal: boolean;
        externalNotes: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
