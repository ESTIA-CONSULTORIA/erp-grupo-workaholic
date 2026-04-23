import { PrismaService } from '../../common/prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getForUser(companyId: string, userId: string, onlyUnread?: boolean): any;
    markRead(id: string, userId: string): Promise<any>;
    markAllRead(companyId: string, userId: string): Promise<any>;
    countUnread(companyId: string, userId: string): any;
}
