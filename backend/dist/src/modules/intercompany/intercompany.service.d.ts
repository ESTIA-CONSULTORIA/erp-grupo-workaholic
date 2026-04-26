import { PrismaService } from '../../common/prisma/prisma.service';
export declare class IntercompanyService {
    private prisma;
    constructor(prisma: PrismaService);
    getTransfers(companyId: string, period?: string): any;
    createTransfer(fromCompanyId: string, userId: string, data: any): Promise<any>;
    approveTransfer(transferId: string, userId: string, approved: boolean, motivo?: string): Promise<any>;
    private _registrarMovimientos;
    private _notificarReceptores;
    private _notificarEmisor;
}
