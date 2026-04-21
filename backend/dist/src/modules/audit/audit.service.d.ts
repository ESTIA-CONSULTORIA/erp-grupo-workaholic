import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    log(data: {
        companyId: string;
        userId: string;
        action: string;
        entity: string;
        entityId?: string;
        before?: any;
        after?: any;
    }): Promise<void>;
    getLogs(companyId: string, filters?: {
        entity?: string;
        userId?: string;
        limit?: number;
    }): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        companyId: string | null;
        userId: string;
        action: string;
        entity: string;
        entityId: string | null;
        before: import("@prisma/client/runtime/library").JsonValue | null;
        after: import("@prisma/client/runtime/library").JsonValue | null;
        ip: string | null;
    })[]>;
}
