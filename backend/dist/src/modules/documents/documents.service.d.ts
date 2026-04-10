import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(companyId: string, status?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    create(companyId: string, userId: string, data: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
    extract(companyId: string, docId: string): Promise<{
        message: string;
    }>;
    validate(docId: string, validatedData: any): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
    reject(docId: string): import(".prisma/client").Prisma.Prisma__DocumentClient<{
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
