import { IntercompanyService } from './intercompany.service';
export declare class IntercompanyController {
    private readonly svc;
    constructor(svc: IntercompanyService);
    getTransfers(cid: string, period?: string): any;
    create(cid: string, req: any, body: any): Promise<any>;
    approve(id: string, req: any, body: {
        approved: boolean;
    }): Promise<any>;
}
