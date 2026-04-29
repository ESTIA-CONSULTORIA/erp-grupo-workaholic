import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ArqueoContadorService {
    private prisma;
    constructor(prisma: PrismaService);
    private ensureTable;
    create(companyId: string, userId: string | null, body: any): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        folio: string;
        ok: boolean;
        differenceVisibleAt: Date;
    }>;
    findAll(companyId: string): Promise<unknown>;
}
