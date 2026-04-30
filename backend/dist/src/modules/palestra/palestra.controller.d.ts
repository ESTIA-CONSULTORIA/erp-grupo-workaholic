import { PalestraService } from './palestra.service';
export declare class PalestraController {
    private svc;
    constructor(svc: PalestraService);
    dashboard(cid: string): Promise<{
        totalMembers: any;
        activeMembers: any;
        morosasCount: any;
        pendingCommissions: {
            total: number;
            count: any;
        };
    }>;
    getServices(cid: string): any;
    createService(cid: string, body: any): any;
    updateService(id: string, body: any): any;
    toggleService(id: string, body: any): any;
    getMembershipTypes(cid: string): any;
    createMembershipType(cid: string, body: any): any;
    updateMembershipType(id: string, body: any): any;
    getMemberships(cid: string, q: any): Promise<any>;
    createMembership(cid: string, body: any): Promise<any>;
    checkOverdue(cid: string): Promise<{
        blocked: number;
    }>;
    addMember(id: string, body: any): any;
    removeMember(mid: string): any;
    getPayments(id: string): Promise<any>;
    registerPayment(id: string, body: any): Promise<any>;
    getCommissions(cid: string, q: any): Promise<any>;
    createCommission(cid: string, body: any): Promise<any>;
    releaseCommissions(cid: string, body: any): Promise<any>;
    freezeCommission(id: string, body: any): Promise<any>;
    getSoftImports(cid: string): any;
    importSoft(cid: string, req: any, body: any): Promise<any>;
    getLowStock(cid: string): import(".prisma/client").Prisma.PrismaPromise<unknown>;
    getProducts(cid: string): any;
    createProduct(cid: string, body: any): any;
    updateProduct(id: string, body: any): any;
    adjustStock(id: string, body: any): Promise<any>;
    registerSale(cid: string, req: any, body: any): Promise<{
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
}
