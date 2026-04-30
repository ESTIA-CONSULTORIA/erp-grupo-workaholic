import { WorkaholicService } from './workaholic.service';
export declare class WorkaholicController {
    private svc;
    constructor(svc: WorkaholicService);
    dashboard(cid: string): Promise<{
        totalMem: any;
        activeMem: any;
        vencidas: any;
        todayRes: any;
        spaces: any;
    }>;
    getSpaces(cid: string): any;
    createSpace(cid: string, body: any): any;
    updateSpace(id: string, body: any): any;
    getTypes(cid: string): any;
    createType(cid: string, body: any): any;
    updateType(id: string, body: any): any;
    getMemberships(cid: string, q: any): Promise<any>;
    createMembership(cid: string, body: any): Promise<any>;
    checkExpired(cid: string): Promise<{
        expired: any;
    }>;
    registerPayment(id: string, body: any): Promise<any>;
    getServices(cid: string): Promise<any>;
    getReservations(cid: string, q: any): Promise<any>;
    createReservation(cid: string, body: any): Promise<any>;
    updateReservation(id: string, body: any): any;
    registerSale(cid: string, body: any): Promise<{
        id: string;
        companyId: string;
        date: Date;
        channel: string;
        clientName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        cutId: string | null;
        createdAt: Date;
        isCredit: boolean;
        clientId: string | null;
    }>;
    getSoftImports(cid: string): any;
    importSoft(cid: string, req: any, body: any): any;
}
