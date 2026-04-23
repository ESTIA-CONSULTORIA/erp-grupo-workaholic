import { IncidentsService } from './incidents.service';
export declare class IncidentsController {
    private svc;
    constructor(svc: IncidentsService);
    getByEmp(cid: string, eid: string): any;
    getByPeriod(cid: string, pid: string): any;
    create(cid: string, req: any, body: any): any;
    update(id: string, body: any): any;
    approve(id: string, req: any, body: any): any;
}
