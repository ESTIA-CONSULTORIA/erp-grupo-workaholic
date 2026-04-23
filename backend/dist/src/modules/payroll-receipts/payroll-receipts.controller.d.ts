import { PayrollReceiptsService } from './payroll-receipts.service';
export declare class PayrollReceiptsController {
    private svc;
    constructor(svc: PayrollReceiptsService);
    getByEmp(cid: string, eid: string): any;
    getByPeriod(cid: string, pid: string): any;
    generate(cid: string, pid: string, req: any): Promise<any[]>;
    publish(pid: string, req: any): Promise<{
        published: any;
    }>;
    ack(id: string, req: any, body: any): Promise<any>;
}
