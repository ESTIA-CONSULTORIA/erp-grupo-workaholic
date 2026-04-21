import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private svc;
    constructor(svc: PermissionsService);
    getDefaults(): Record<string, Record<string, string[]>>;
    getByRole(role: string, cid?: string): Promise<Record<string, string[]>>;
    getAll(cid?: string): Promise<Record<string, any>>;
    update(role: string, mod: string, action: string, body: {
        allowed: boolean;
        companyId?: string;
    }): Promise<any>;
    reset(role: string, body: {
        companyId?: string;
    }): Promise<{
        reset: boolean;
        role: string;
    }>;
}
