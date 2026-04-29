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
        companyId: string;
        sku: string;
        name: string;
        meatType: string;
        flavor: string;
        presentation: string;
        gramsWeight: number | null;
        isActive: boolean;
        priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
        priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
        priceOnline: import("@prisma/client/runtime/library").Decimal | null;
        priceML: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    getLotes(companyId: string): import(".prisma/client").Prisma.PrismaPromise<({
        insumos: {
            id: string;
            createdAt: Date;
            loteId: string;
            insumoId: string | null;
            nombre: string;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            unidad: string;
            costoUnitario: import("@prisma/client/runtime/library").Decimal;
            costoTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
        empaques: ({
            product: {
                id: string;
                companyId: string;
                sku: string;
                name: string;
                meatType: string;
                flavor: string;
                presentation: string;
                gramsWeight: number | null;
                isActive: boolean;
                priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
                priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
                priceOnline: import("@prisma/client/runtime/library").Decimal | null;
                priceML: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            productId: string;
            createdAt: Date;
            loteId: string;
            cantidad: number;
            costoUnit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        companyId: string;
        fecha: Date;
        tipo: string;
        status: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    crearLote(companyId: string, userId: string, data: any): Promise<{
        insumos: {
            id: string;
            createdAt: Date;
            loteId: string;
            insumoId: string | null;
            nombre: string;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            unidad: string;
            costoUnitario: import("@prisma/client/runtime/library").Decimal;
            costoTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        fecha: Date;
        tipo: string;
        status: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    registrarSalidaHorno(loteId: string, data: any): Promise<{
        id: string;
        companyId: string;
        fecha: Date;
        tipo: string;
        status: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    registrarEmpaque(loteId: string, data: any): Promise<{
        insumos: {
            id: string;
            createdAt: Date;
            loteId: string;
            insumoId: string | null;
            nombre: string;
            cantidad: import("@prisma/client/runtime/library").Decimal;
            unidad: string;
            costoUnitario: import("@prisma/client/runtime/library").Decimal;
            costoTotal: import("@prisma/client/runtime/library").Decimal;
        }[];
        empaques: ({
            product: {
                id: string;
                companyId: string;
                sku: string;
                name: string;
                meatType: string;
                flavor: string;
                presentation: string;
                gramsWeight: number | null;
                isActive: boolean;
                priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
                priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
                priceOnline: import("@prisma/client/runtime/library").Decimal | null;
                priceML: import("@prisma/client/runtime/library").Decimal | null;
            };
        } & {
            id: string;
            productId: string;
            createdAt: Date;
            loteId: string;
            cantidad: number;
            costoUnit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        companyId: string;
        fecha: Date;
        tipo: string;
        status: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    cerrarLote(loteId: string): Promise<{
        id: string;
        companyId: string;
        fecha: Date;
        tipo: string;
        status: string;
        kgEntrada: import("@prisma/client/runtime/library").Decimal;
        kgSalida: import("@prisma/client/runtime/library").Decimal;
        kgGrasa: import("@prisma/client/runtime/library").Decimal;
        kgMerma: import("@prisma/client/runtime/library").Decimal;
        rendimiento: import("@prisma/client/runtime/library").Decimal;
        kgEscarchado: import("@prisma/client/runtime/library").Decimal;
        notas: string | null;
        creadoPor: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProduct(productId: string, data: any): import(".prisma/client").Prisma.Prisma__ProductClient<{
        id: string;
        companyId: string;
        sku: string;
        name: string;
        meatType: string;
        flavor: string;
        presentation: string;
        gramsWeight: number | null;
        isActive: boolean;
        priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
        priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
        priceOnline: import("@prisma/client/runtime/library").Decimal | null;
        priceML: import("@prisma/client/runtime/library").Decimal | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    createProduct(companyId: string, data: any): Promise<{
        id: string;
        companyId: string;
        sku: string;
        name: string;
        meatType: string;
        flavor: string;
        presentation: string;
        gramsWeight: number | null;
        isActive: boolean;
        priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
        priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
        priceOnline: import("@prisma/client/runtime/library").Decimal | null;
        priceML: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getPTInventory(companyId: string): Promise<{
        stock: number;
        minStock: number;
        maxStock: number;
        lowStock: boolean;
        currentStock: {
            id: string;
            productId: string;
            stock: import("@prisma/client/runtime/library").Decimal;
            minStock: import("@prisma/client/runtime/library").Decimal;
        };
        id: string;
        companyId: string;
        sku: string;
        name: string;
        meatType: string;
        flavor: string;
        presentation: string;
        gramsWeight: number | null;
        isActive: boolean;
        priceMostrador: import("@prisma/client/runtime/library").Decimal | null;
        priceMayoreo: import("@prisma/client/runtime/library").Decimal | null;
        priceOnline: import("@prisma/client/runtime/library").Decimal | null;
        priceML: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    updateProductStock(productId: string, data: any): Promise<{
        id: string;
        productId: string;
        stock: import("@prisma/client/runtime/library").Decimal;
        minStock: import("@prisma/client/runtime/library").Decimal;
    }>;
    getInsumos(companyId: string): any;
    createInsumo(companyId: string, data: any): Promise<any>;
    updateInsumo(insumoId: string, data: any): Promise<any>;
    comprarInsumo(companyId: string, data: any): Promise<{
        success: boolean;
        total: number;
    }>;
    cancelarCompra(companyId: string, compraId: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string | null;
        rubricId: string | null;
        userId: string;
        date: Date;
        concept: string;
        total: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        affectsInventory: boolean;
        invoiceRef: string | null;
    }>;
    getCompras(companyId: string, filters?: any): Promise<({
        supplier: {
            id: string;
            name: string;
        };
        items: {
            id: string;
            productId: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            purchaseId: string;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string | null;
        rubricId: string | null;
        userId: string;
        date: Date;
        concept: string;
        total: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        affectsInventory: boolean;
        invoiceRef: string | null;
    })[]>;
    crearCompra(companyId: string, userId: string, data: any): Promise<{
        supplier: {
            id: string;
            name: string;
        };
        items: {
            id: string;
            productId: string | null;
            total: import("@prisma/client/runtime/library").Decimal;
            purchaseId: string;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string | null;
        rubricId: string | null;
        userId: string;
        date: Date;
        concept: string;
        total: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        affectsInventory: boolean;
        invoiceRef: string | null;
    }>;
    getRecipes(companyId: string): import(".prisma/client").Prisma.PrismaPromise<({
        ingredients: {
            id: string;
            unit: string;
            recipeId: string;
            inputName: string;
            quantityPer100g: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        isActive: boolean;
        createdAt: Date;
        key: string;
        theoreticalYield: import("@prisma/client/runtime/library").Decimal;
        versionNumber: number;
        changedById: string | null;
        changeNote: string | null;
    })[]>;
    getSales(companyId: string, period?: string, channel?: string, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        lines: ({
            product: {
                id: string;
                companyId: string;
                sku: string;
                name: string;
                meatType: string;
                flavor: string;
                presentation: string;
                gramsWeight: number | null;
                isActive: boolean;
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
            saleId: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        client: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        channel: string;
        clientName: string | null;
        paymentMethod: string;
        cutId: string | null;
        clientId: string | null;
        isCredit: boolean;
    })[]>;
    private _normalizarMetodo;
    registerSale(companyId: string, data: any): Promise<({
        lines: ({
            product: {
                id: string;
                companyId: string;
                sku: string;
                name: string;
                meatType: string;
                flavor: string;
                presentation: string;
                gramsWeight: number | null;
                isActive: boolean;
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
            saleId: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        channel: string;
        clientName: string | null;
        paymentMethod: string;
        cutId: string | null;
        clientId: string | null;
        isCredit: boolean;
    }) | {
        success: boolean;
        isOCDelivery: boolean;
        total: number;
    }>;
}
