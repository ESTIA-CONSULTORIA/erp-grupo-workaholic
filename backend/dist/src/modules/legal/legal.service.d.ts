import { PrismaService } from '../../common/prisma/prisma.service';
export declare class LegalService {
    private prisma;
    constructor(prisma: PrismaService);
    getByEmployee(companyId: string, employeeId: string): any;
    generate(companyId: string, userId: string, data: any): Promise<any>;
    update(id: string, data: any): any;
    sign(id: string, userId: string, byEmployee: boolean): any;
}
