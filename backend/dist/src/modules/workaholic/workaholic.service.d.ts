import { PrismaService } from '../../common/prisma/prisma.service';
export declare class WorkaholicService {
    private prisma;
    constructor(prisma: PrismaService);
    getSpaces(companyId: string): any;
    createSpace(companyId: string, data: any): any;
    updateSpace(id: string, data: any): any;
    getMembershipTypes(companyId: string): any;
    createMembershipType(companyId: string, data: any): any;
    updateMembershipType(id: string, data: any): any;
    getMemberships(companyId: string, filters?: any): Promise<any>;
    createMembership(companyId: string, data: any): Promise<any>;
    registerPayment(membershipId: string, data: any): Promise<any>;
    getReservations(companyId: string, filters?: any): Promise<any>;
    createReservation(companyId: string, data: any): Promise<any>;
    updateReservation(id: string, data: any): any;
    registerSale(companyId: string, data: any): Promise<{
        date: Date;
        id: string;
        companyId: string;
        channel: string;
        clientName: string | null;
        total: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string;
        cutId: string | null;
        createdAt: Date;
        isCredit: boolean;
        clientId: string | null;
    }>;
    getDashboard(companyId: string): Promise<{
        totalMem: any;
        activeMem: any;
        vencidasMem: any;
        todayRes: any;
        spaces: any;
    }>;
    checkExpired(companyId: string): Promise<{
        expired: any;
    }>;
    importSoftRestaurant(companyId: string, data: any, userId?: string): Promise<any>;
    getSoftImports(companyId: string): any;
    private _calcEndDate;
    private _calcHours;
    private _getPeriodLabel;
}
