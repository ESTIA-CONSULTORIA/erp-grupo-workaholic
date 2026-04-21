import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly svc;
    constructor(svc: AuditService);
    getLogs(cid: string, entity?: string, limit?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
