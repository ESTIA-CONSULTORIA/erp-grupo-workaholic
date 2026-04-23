import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ApprovalsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(companyId: string, userId: string, roleCode: string, data: any): Promise<any>;
    findOne(id: string): any;
    getByCompany(companyId: string, filters?: any): any;
    getPendingForUser(companyId: string, userId: string, roleCode: string): any;
    act(requestId: string, stepId: string, userId: string, approved: boolean, comment?: string): Promise<{
        status: string;
    }>;
    cancel(requestId: string, userId: string, reason: string): Promise<{
        status: string;
    }>;
    private _getStepsForType;
    private _notifyStep;
    private _notifyRequester;
    private _audit;
    private _onApproved;
}
