import { PrismaService } from '../../common/prisma/prisma.service';
export declare class IncidentsService {
    private prisma;
    constructor(prisma: PrismaService);
    getByEmployee(companyId: string, employeeId: string): any;
    getByPeriod(companyId: string, periodId: string): any;
    create(companyId: string, userId: string, data: any): any;
    update(id: string, data: any): any;
    approve(id: string, managerId: string, hrId: string): any;
    applyToPayroll(id: string, payrollId: string): any;
}
