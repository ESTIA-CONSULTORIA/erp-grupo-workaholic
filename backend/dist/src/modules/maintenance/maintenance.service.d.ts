import { PrismaService } from '../../common/prisma/prisma.service';
export declare class MaintenanceService {
    private prisma;
    constructor(prisma: PrismaService);
    seedUsers(): Promise<{
        results: string[];
    }>;
    fixOCSales(companyId: string): Promise<{
        total: number;
        created: number;
        errors: string[];
    }>;
}
