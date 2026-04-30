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
        name: string;
        id: string;
        companyId: string;
        sku: string;
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
    getLotes(cid: string): import(".prisma/client").Prisma.PrismaPromise<({
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
                name: string;
                id: string;
                companyId: string;
                sku: string;
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
            createdAt: Date;
            productId: string;
            loteId: string;
            cantidad: number;
            costoUnit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
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
        updatedAt: Date;
    })[]>;
    crearLote(cid: string, body: any, req: any): Promise<{
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
        createdAt: Date;
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
        updatedAt: Date;
    }>;
    salida(id: string, body: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
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
        updatedAt: Date;
    }>;
    empaque(id: string, body: any): Promise<{
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
                name: string;
                id: string;
                companyId: string;
                sku: string;
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
            createdAt: Date;
            productId: string;
            loteId: string;
            cantidad: number;
            costoUnit: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        companyId: string;
        createdAt: Date;
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
        updatedAt: Date;
    }>;
    cerrar(id: string): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
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
        updatedAt: Date;
    }>;
    updateProduct(id: string, body: any): import(".prisma/client").Prisma.Prisma__ProductClient<{
        name: string;
        id: string;
        companyId: string;
        sku: string;
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
    updateStockLimits(id: string, body: any): Promise<{
        id: string;
        productId: string;
        stock: import("@prisma/client/runtime/library").Decimal;
        minStock: import("@prisma/client/runtime/library").Decimal;
    }>;
    getPT(cid: string): Promise<{
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
        name: string;
        id: string;
        companyId: string;
        sku: string;
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
    getInsumos(cid: string): any;
    comprarInsumo(cid: string, body: any): Promise<{
        success: boolean;
        total: number;
    }>;
    createProduct(cid: string, body: any): Promise<{
        name: string;
        id: string;
        companyId: string;
        sku: string;
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
    createInsumo(cid: string, body: any): Promise<any>;
    updateInsumo(id: string, body: any): Promise<any>;
    getRecipes(cid: string): import(".prisma/client").Prisma.PrismaPromise<({
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
        createdAt: Date;
        isActive: boolean;
        key: string;
        theoreticalYield: import("@prisma/client/runtime/library").Decimal;
        versionNumber: number;
        changedById: string | null;
        changeNote: string | null;
    })[]>;
    getSales(cid: string, period?: string, channel?: string, startDate?: string, endDate?: string): import(".prisma/client").Prisma.PrismaPromise<({
        lines: ({
            product: {
                name: string;
                id: string;
                companyId: string;
                sku: string;
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
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            saleId: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        client: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        companyId: string;
        date: Date;
        channel: string;
        clientName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        cutId: string | null;
        createdAt: Date;
        isCredit: boolean;
        clientId: string | null;
    })[]>;
    registerSale(cid: string, body: any): Promise<({
        lines: ({
            product: {
                name: string;
                id: string;
                companyId: string;
                sku: string;
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
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            saleId: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        companyId: string;
        date: Date;
        channel: string;
        clientName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        cutId: string | null;
        createdAt: Date;
        isCredit: boolean;
        clientId: string | null;
    }) | {
        success: boolean;
        isOCDelivery: boolean;
        total: number;
    }>;
    salesReport(cid: string, period: string): import(".prisma/client").Prisma.PrismaPromise<({
        lines: ({
            product: {
                name: string;
                id: string;
                companyId: string;
                sku: string;
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
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            saleId: string;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
        })[];
        client: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        companyId: string;
        date: Date;
        channel: string;
        clientName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        cutId: string | null;
        createdAt: Date;
        isCredit: boolean;
        clientId: string | null;
    })[]>;
    cancelarCompra(cid: string, compraId: string): Promise<{
        id: string;
        companyId: string;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string | null;
        rubricId: string | null;
        userId: string;
        concept: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        affectsInventory: boolean;
        invoiceRef: string | null;
    }>;
    getCompras(cid: string, proveedorId?: string, fechaIni?: string, fechaFin?: string, status?: string): Promise<({
        supplier: {
            name: string;
            id: string;
        };
        items: {
            id: string;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            purchaseId: string;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string | null;
        rubricId: string | null;
        userId: string;
        concept: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        affectsInventory: boolean;
        invoiceRef: string | null;
    })[]>;
    crearCompra(cid: string, body: any, req: any): Promise<{
        supplier: {
            name: string;
            id: string;
        };
        items: {
            id: string;
            total: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            purchaseId: string;
            description: string;
            quantity: import("@prisma/client/runtime/library").Decimal;
            unit: string | null;
            unitCost: import("@prisma/client/runtime/library").Decimal;
        }[];
    } & {
        id: string;
        companyId: string;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string | null;
        rubricId: string | null;
        userId: string;
        concept: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal;
        totalMxn: import("@prisma/client/runtime/library").Decimal;
        paymentStatus: string;
        affectsInventory: boolean;
        invoiceRef: string | null;
    }>;
}
