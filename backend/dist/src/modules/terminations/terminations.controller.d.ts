import { TerminationsService } from './terminations.service';
export declare class TerminationsController {
    private svc;
    constructor(svc: TerminationsService);
    getAll(cid: string): any;
    getOne(id: string): any;
    create(cid: string, req: any, body: any): Promise<any>;
    update(id: string, body: any): any;
    submit(id: string, req: any): Promise<any>;
}
