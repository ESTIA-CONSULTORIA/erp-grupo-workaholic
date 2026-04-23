import { DisabilitiesService } from './disabilities.service';
export declare class DisabilitiesController {
    private svc;
    constructor(svc: DisabilitiesService);
    get(cid: string, eid: string): any;
    create(cid: string, body: any): Promise<any>;
    update(id: string, body: any): any;
    validate(id: string, req: any): any;
}
