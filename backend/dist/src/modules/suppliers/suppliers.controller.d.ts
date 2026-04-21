import { SuppliersService } from './suppliers.service';
export declare class SuppliersController {
    private svc;
    constructor(svc: SuppliersService);
    findAll(cid: string, active?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        notes: string | null;
    }[]>;
    create(cid: string, body: any): import(".prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        notes: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, body: any): import(".prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        notes: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
