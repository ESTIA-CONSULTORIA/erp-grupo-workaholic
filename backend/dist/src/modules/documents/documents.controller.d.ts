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
        companyId: string;
        userId: string;
        type: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        status: string;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(cid: string, req: any, body: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        companyId: string;
        userId: string;
        type: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        status: string;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    extract(cid: string, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    update(id: string, body: any): Promise<{
        id: string;
        companyId: string;
        userId: string;
        type: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        status: string;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validate(id: string, body: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        companyId: string;
        userId: string;
        type: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        status: string;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    reject(id: string): import(".prisma/client").Prisma.Prisma__DocumentClient<{
        id: string;
        companyId: string;
        userId: string;
        type: string;
        fileUrl: string | null;
        fileName: string | null;
        mimeType: string | null;
        status: string;
        extractedJson: import("@prisma/client/runtime/library").JsonValue | null;
        validatedJson: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
