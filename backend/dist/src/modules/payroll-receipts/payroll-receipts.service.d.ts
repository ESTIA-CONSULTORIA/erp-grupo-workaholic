import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PayrollReceiptsService {
    private prisma;
    constructor(prisma: PrismaService);
    getByEmployee(companyId: string, employeeId: string): any;
    getByPeriod(companyId: string, periodId: string): any;
    generate(companyId: string, periodId: string, userId: string): Promise<any[]>;
    publish(periodId: string, userId: string): Promise<{
        published: any;
    }>;
    acknowledge(id: string, employeeId: string): Promise<any>;
}
