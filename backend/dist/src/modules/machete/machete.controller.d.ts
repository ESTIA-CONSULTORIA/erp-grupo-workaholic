import { MacheteService } from './machete.service';
export declare class MacheteController {
    private svc;
    constructor(svc: MacheteService);
    getProducts(cid: string): import(".prisma/client").Prisma.PrismaPromise<({
        currentStock: {
            id: string;
            productId: string;
            stock: import("@prisma/client/runtime/library").Decimal;
            minStock: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        companyId: string;
        sku: string;
        meatType: string;
        flavor: string;
        presentation: string;
        gramsWeight: number | null;
        priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
        priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
        priceOnline: import("@prisma/client/runtime/library").Decimal | null;
        priceML: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getPT(cid: string): Promise<{
        stock: number | import("@prisma/client/runtime/library").Decimal;
        minStock: number | import("@prisma/client/runtime/library").Decimal;
        lowStock: boolean;
        currentStock: {
            id: string;
            productId: string;
            stock: import("@prisma/client/runtime/library").Decimal;
            minStock: import("@prisma/client/runtime/library").Decimal;
        };
        id: string;
        name: string;
        isActive: boolean;
        companyId: string;
        sku: string;
        meatType: string;
        flavor: string;
        presentation: string;
        gramsWeight: number | null;
        priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
        priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
        priceOnline: import("@prisma/client/runtime/library").Decimal | null;
        priceML: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getRecipes(cid: string): import(".prisma/client").Prisma.PrismaPromise<({
        ingredients: {
            id: string;
            recipeId: string;
            inputName: string;
            quantityPer100g: import("@prisma/client/runtime/library").Decimal;
            unit: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        key: string;
        theoreticalYield: import("@prisma/client/runtime/library").Decimal;
        versionNumber: number;
        changedById: string | null;
        changeNote: string | null;
    })[]>;
    getSales(cid: string, period?: string, channel?: string): import(".prisma/client").Prisma.PrismaPromise<({
        lines: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                companyId: string;
                sku: string;
                meatType: string;
                flavor: string;
                presentation: string;
                gramsWeight: number | null;
                priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
                priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
                priceOnline: import("@prisma/client/runtime/library").Decimal | null;
                priceML: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        date: Date;
        cutId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        channel: string;
        clientName: string | null;
    })[]>;
    registerSale(cid: string, body: any): Promise<{
        lines: ({
            product: {
                id: string;
                name: string;
                isActive: boolean;
                companyId: string;
                sku: string;
                meatType: string;
                flavor: string;
                presentation: string;
                gramsWeight: number | null;
                priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
                priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
                priceOnline: import("@prisma/client/runtime/library").Decimal | null;
                priceML: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        date: Date;
        cutId: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        channel: string;
        clientName: string | null;
    }>;
    salesReport(cid: string, period: string): Promise<{
        period: string;
        totalRevenue: number;
        totalUnits: number;
        byChannel: {
            canal: string;
            revenue: number;
        }[];
        bySKU: any[];
        production: {
            lotes: number;
            totalKgIn: number;
            totalKgOut: number;
            totalWaste: number;
            avgYield: number;
        };
    }>;
}
