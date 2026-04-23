import { ApprovalsService } from './approvals.service';
export declare class ApprovalsController {
    private svc;
    constructor(svc: ApprovalsService);
    create(cid: string, req: any, body: any): Promise<any>;
    getAll(cid: string, q: any): any;
    getPending(cid: string, req: any, role: string): any;
    getOne(id: string): any;
    act(id: string, sid: string, req: any, body: any): Promise<{
        status: string;
    }>;
    cancel(id: string, req: any, body: any): Promise<{
        status: string;
    }>;
}
