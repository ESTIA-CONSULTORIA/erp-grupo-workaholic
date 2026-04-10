import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private svc;
    constructor(svc: DocumentsService);
    findAll(cid: string, status?: string): import(".prisma/client").Prisma.PrismaPromise<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        type: string;
        userId: string;
        status: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    create(cid: string, req: any, body: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        type: string;
        userId: string;
        status: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    extract(cid: string, id: string): Promise<{
        message: string;
    }>;
    validate(id: string, body: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        type: string;
        userId: string;
        status: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    reject(id: string): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        type: string;
        userId: string;
        status: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
