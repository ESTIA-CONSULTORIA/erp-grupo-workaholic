import { PrismaService } from '../../common/prisma/prisma.service';
export declare class SuppliersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, active?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        notes: string | null;
    }[]>;
    create(companyId: string, data: any): import(".prisma/client").Prisma.Prisma__SupplierClient<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        companyId: string;
        email: string | null;
        phone: string | null;
        notes: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, data: any): import(".prisma/client").Prisma.Prisma__SupplierClient<{
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
