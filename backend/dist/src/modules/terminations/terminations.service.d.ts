import { PrismaService } from '../../common/prisma/prisma.service';
export declare class TerminationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getByCompany(companyId: string): any;
    findOne(id: string): any;
    create(companyId: string, userId: string, data: any): Promise<any>;
    update(id: string, data: any): any;
    submitForApproval(id: string, userId: string, roleCode: string): Promise<any>;
    private _lftVacDays;
}
