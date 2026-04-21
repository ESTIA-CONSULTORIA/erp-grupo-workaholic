import { CompaniesService } from './companies.service';
export declare class CompaniesController {
    private svc;
    constructor(svc: CompaniesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        code: string;
        name: string;
        color: string;
        logoUrl: string | null;
        hasAB: boolean;
        hasProduction: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__CompanyClient<{
        branches: {
            id: string;
            code: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            companyId: string;
        }[];
    } & {
        id: string;
        code: string;
        name: string;
        color: string;
        logoUrl: string | null;
        hasAB: boolean;
        hasProduction: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    getCashAccounts(id: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        code: string;
        name: string;
        isActive: boolean;
        companyId: string;
        type: string;
        currency: string;
        bankName: string | null;
        accountNumber: string | null;
    }[]>;
    getUsers(id: string): import(".prisma/client").Prisma.PrismaPromise<({
        role: {
            id: string;
            code: string;
            name: string;
            description: string;
        };
        user: {
            id: string;
            name: string;
            isActive: boolean;
            email: string;
        };
    } & {
        id: string;
        companyId: string;
        userId: string;
        roleId: string;
    })[]>;
    createUser(companyId: string, body: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        phone: string | null;
        pin: string | null;
    }>;
    updateUser(userId: string, body: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        phone: string | null;
        pin: string | null;
    }>;
    toggleUser(userId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        passwordHash: string;
        phone: string | null;
        pin: string | null;
    }>;
    getFinancialRubrics(id: string): Promise<any[]>;
    getClients(id: string): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            ordenesCompra: number;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        rfc: string | null;
        address: string | null;
        creditDays: number;
    })[]>;
    createClient(id: string, body: any): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        rfc: string | null;
        address: string | null;
        creditDays: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateClient(clientId: string, body: any): import(".prisma/client").Prisma.Prisma__ClientClient<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        rfc: string | null;
        address: string | null;
        creditDays: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    getClientDetail(clientId: string): import(".prisma/client").Prisma.Prisma__ClientClient<{
        receivables: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            currency: string;
            notes: string | null;
            clientId: string;
            status: string;
            date: Date;
            cutLineId: string | null;
            rubricId: string | null;
            dueDate: Date | null;
            originalAmount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal;
            balance: import("@prisma/client/runtime/library").Decimal;
        }[];
        ordenesCompra: ({
            surtidos: {
                id: string;
                createdAt: Date;
                notes: string | null;
                fecha: Date;
                ordenCompraId: string;
                monto: import("@prisma/client/runtime/library").Decimal;
            }[];
            lineas: ({
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
                ordenCompraId: string;
                cantidad: number;
                cantidadSurtida: number;
                precioUnitario: import("@prisma/client/runtime/library").Decimal;
                total: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            companyId: string;
            notes: string | null;
            fecha: Date;
            clientId: string;
            numero: string;
            montoTotal: import("@prisma/client/runtime/library").Decimal;
            montoSurtido: import("@prisma/client/runtime/library").Decimal;
            saldo: import("@prisma/client/runtime/library").Decimal;
            status: string;
        })[];
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        creditLimit: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        rfc: string | null;
        address: string | null;
        creditDays: number;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    getOrdenes(companyId: string, clientId?: string, status?: string): Promise<({
        client: {
            id: string;
            name: string;
        };
        surtidos: {
            id: string;
            createdAt: Date;
            notes: string | null;
            fecha: Date;
            ordenCompraId: string;
            monto: import("@prisma/client/runtime/library").Decimal;
        }[];
        lineas: ({
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
            ordenCompraId: string;
            cantidad: number;
            cantidadSurtida: number;
            precioUnitario: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        notes: string | null;
        fecha: Date;
        clientId: string;
        numero: string;
        montoTotal: import("@prisma/client/runtime/library").Decimal;
        montoSurtido: import("@prisma/client/runtime/library").Decimal;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
    })[]>;
    createOrden(cid: string, clientId: string, body: any): Promise<{
        lineas: ({
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
            ordenCompraId: string;
            cantidad: number;
            cantidadSurtida: number;
            precioUnitario: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        notes: string | null;
        fecha: Date;
        clientId: string;
        numero: string;
        montoTotal: import("@prisma/client/runtime/library").Decimal;
        montoSurtido: import("@prisma/client/runtime/library").Decimal;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
    registrarSurtido(ordenId: string, body: any): Promise<[{
        id: string;
        createdAt: Date;
        notes: string | null;
        fecha: Date;
        ordenCompraId: string;
        monto: import("@prisma/client/runtime/library").Decimal;
    }, {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        notes: string | null;
        fecha: Date;
        clientId: string;
        numero: string;
        montoTotal: import("@prisma/client/runtime/library").Decimal;
        montoSurtido: import("@prisma/client/runtime/library").Decimal;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }]>;
    cancelarOC(ordenId: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        notes: string | null;
        fecha: Date;
        clientId: string;
        numero: string;
        montoTotal: import("@prisma/client/runtime/library").Decimal;
        montoSurtido: import("@prisma/client/runtime/library").Decimal;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
    cerrarOC(ordenId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        notes: string | null;
        fecha: Date;
        clientId: string;
        numero: string;
        montoTotal: import("@prisma/client/runtime/library").Decimal;
        montoSurtido: import("@prisma/client/runtime/library").Decimal;
        saldo: import("@prisma/client/runtime/library").Decimal;
        status: string;
    }>;
}
