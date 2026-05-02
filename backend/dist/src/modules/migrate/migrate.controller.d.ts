import { PrismaService } from '../../common/prisma/prisma.service';
export declare class MigrateController {
    private prisma;
    constructor(prisma: PrismaService);
    status(secret: string): Promise<{
        error: string;
        tables?: undefined;
    } | {
        tables: unknown;
        error?: undefined;
    }>;
    run(secret: string): Promise<{
        error: string;
        ok?: undefined;
        fail?: undefined;
        results?: undefined;
    } | {
        ok: number;
        fail: number;
        results: any[];
        error?: undefined;
    }>;
}
