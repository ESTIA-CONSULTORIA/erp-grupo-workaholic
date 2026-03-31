import { PrismaService } from '../../common/prisma/prisma.service';
export declare class CompaniesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getUsers(companyId: string): import(".prisma/client").Prisma.PrismaPromise<({
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
}
