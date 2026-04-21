import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PalestraService {
    private prisma;
    constructor(prisma: PrismaService);
    getServices(companyId: string): any;
    createService(companyId: string, data: any): any;
    updateService(id: string, data: any): any;
    toggleService(id: string, isActive: boolean): any;
    getMembershipTypes(companyId: string): any;
    createMembershipType(companyId: string, data: any): any;
    updateMembershipType(id: string, data: any): any;
    getMemberships(companyId: string, filters?: any): Promise<any>;
    createMembership(companyId: string, data: any): Promise<any>;
    addMember(membershipId: string, data: any): any;
    removeMember(memberId: string): any;
    getMembershipPayments(membershipId: string): Promise<any>;
    registerPayment(membershipId: string, data: any): Promise<any>;
    checkAndBlockOverdue(companyId: string): Promise<{
        blocked: number;
    }>;
    getCommissions(companyId: string, filters?: any): Promise<any>;
    createCommission(companyId: string, data: any): Promise<any>;
    releaseCommissions(companyId: string, weekPeriod: string, employeeId?: string): Promise<any>;
    freezeCommission(id: string, reason: string): Promise<any>;
    importSoftRestaurant(companyId: string, data: any, userId?: string): Promise<any>;
    getSoftImports(companyId: string): any;
    getProducts(companyId: string): any;
    createProduct(companyId: string, data: any): any;
    updateProduct(id: string, data: any): any;
    adjustStock(id: string, qty: number, notes?: string): Promise<any>;
    getLowStock(companyId: string): import(".prisma/client").Prisma.PrismaPromise<unknown>;
    registerSale(companyId: string, userId: string, data: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        date: Date;
        total: import("@prisma/client/runtime/library").Decimal;
        channel: string;
        clientName: string | null;
        paymentMethod: string;
        cutId: string | null;
        isCredit: boolean;
        clientId: string | null;
    }>;
    private _getWeekPeriod;
    getDashboard(companyId: string): Promise<{
        totalMembers: any;
        activeMembers: any;
        morosasCount: any;
        pendingCommissions: {
            total: number;
            count: any;
        };
    }>;
}
