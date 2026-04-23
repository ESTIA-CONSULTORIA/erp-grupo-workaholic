import { PrismaService } from '../../common/prisma/prisma.service';
export declare class DisabilitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    getByEmployee(companyId: string, employeeId: string): any;
    create(companyId: string, data: any): Promise<any>;
    update(id: string, data: any): any;
    validate(id: string, hrId: string): any;
}
