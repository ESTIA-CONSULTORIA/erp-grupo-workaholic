import { PrismaService } from '../../common/prisma/prisma.service';
export declare class MacheteService {
    private prisma;
    constructor(prisma: PrismaService);
    getProducts(companyId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    getLotes(companyId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
            costoUnit: import("@prisma/client/runtime/library").Decimal;
            loteId: string;
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
    crearLote(companyId: string, userId: string, data: any): Promise<{
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
    registrarSalidaHorno(loteId: string, data: any): Promise<{
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
    registrarEmpaque(loteId: string, data: any): Promise<{
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
    cerrarLote(loteId: string): Promise<{
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
    updateProduct(productId: string, data: any): import(".prisma/client").Prisma.Prisma__ProductClient<{
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
    getPTInventory(companyId: string): Promise<{
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
    getInsumos(companyId: string): any;
    getRecipes(companyId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    getSales(companyId: string, period?: string, channel?: string, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        clientId: string | null;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        cutId: string | null;
        paymentMethod: string;
        channel: string;
        clientName: string | null;
        isCredit: boolean;
    })[]>;
    registerSale(companyId: string, data: any): Promise<{
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
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        companyId: string;
        clientId: string | null;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        cutId: string | null;
        paymentMethod: string;
        channel: string;
        clientName: string | null;
        isCredit: boolean;
    }>;
}
