import { LegalService } from './legal.service';
export declare class LegalController {
    private svc;
    constructor(svc: LegalService);
    get(cid: string, eid: string): any;
    generate(cid: string, req: any, body: any): Promise<any>;
    update(id: string, body: any): any;
    sign(id: string, req: any, body: any): any;
}
