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
}
