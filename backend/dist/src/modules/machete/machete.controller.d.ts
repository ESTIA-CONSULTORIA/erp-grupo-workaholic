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
    getLotes(cid: string): import(".prisma/client").Prisma.PrismaPromise<({
        insumos: {
            id: string;
            createdAt: Date;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            loteId: string;
            insumoId: string | null;
            nombre: string;
            unidad: string;
            costoUnitario: import("@prisma/client/runtime/library").Decimal;
            costoTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
        empaques: ({
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
            createdAt: Date;
            productId: string;
            cantidad: number;
            loteId: string;
            costoUnit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        tipo: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
    })[]>;
    crearLote(cid: string, body: any, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        tipo: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
    }>;
    salida(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        tipo: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
    }>;
    empaque(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        tipo: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
    }>;
    cerrar(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        fecha: Date;
        status: string;
        tipo: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
    }>;
    updateProduct(id: string, body: any): import(".prisma/client").Prisma.Prisma__ProductClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getPT(cid: string): Promise<{
        stock: any;
        minStock: any;
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
    getInsumos(cid: string): any;
    comprarInsumo(cid: string, body: any): Promise<{
        success: boolean;
        total: number;
    }>;
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
    getSales(cid: string, period?: string, channel?: string, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            name: string;
        };
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
            productId: string;
            total: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        clientId: string | null;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        channel: string;
        clientName: string | null;
        paymentMethod: string;
        cutId: string | null;
        isCredit: boolean;
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
            productId: string;
            total: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        clientId: string | null;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        channel: string;
        clientName: string | null;
        paymentMethod: string;
        cutId: string | null;
        isCredit: boolean;
    }>;
    salesReport(cid: string, period: string): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: string;
            name: string;
        };
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
            productId: string;
            total: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        clientId: string | null;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        channel: string;
        clientName: string | null;
        paymentMethod: string;
        cutId: string | null;
        isCredit: boolean;
    })[]>;
}
