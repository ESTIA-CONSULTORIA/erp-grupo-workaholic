import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    private anthropic;
    constructor(prisma: PrismaService);
    findAll(companyId: string, status?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(companyId: string, userId: string, data: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
    extract(companyId: string, docId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    update(docId: string, data: any): Promise<{
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
    validate(docId: string, validatedData: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
    reject(docId: string): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
