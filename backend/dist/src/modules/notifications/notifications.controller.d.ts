import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private svc;
    constructor(svc: NotificationsService);
    get(cid: string, req: any, unread: string): any;
    count(cid: string, req: any): any;
    markRead(id: string, req: any): Promise<any>;
    markAllRead(cid: string, req: any): Promise<any>;
}
