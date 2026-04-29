import { ArqueoContadorService } from './arqueo-contador.service';
export declare class ArqueoContadorController {
    private readonly service;
    constructor(service: ArqueoContadorService);
    create(companyId: string, body: any, req: any): Promise<{
        id: `${string}-${string}-${string}-${string}-${string}`;
        folio: string;
        ok: boolean;
        differenceVisibleAt: Date;
    }>;
    findAll(companyId: string): Promise<unknown>;
}
