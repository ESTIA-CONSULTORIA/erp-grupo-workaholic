import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private svc;
    constructor(svc: PermissionsService);
    getModules(cid: string, code: string): {
        key: string;
        actions: string[];
    }[];
    getRoles(cid: string, code: string): Promise<any[]>;
    createRole(cid: string, body: any): Promise<any>;
    updateRole(cid: string, rc: string, body: any): Promise<any>;
    suspendRole(cid: string, rc: string): Promise<any>;
    deleteRole(cid: string, rc: string): Promise<any>;
    copyFrom(cid: string, to: string, from: string): Promise<Record<string, string[]>>;
    getAll(cid: string): Promise<Record<string, Record<string, string[]>>>;
    getForRole(cid: string, rc: string): Promise<Record<string, string[]>>;
    setPermission(cid: string, role: string, module: string, action: string, body: {
        allowed: boolean;
    }): Promise<any>;
    reset(cid: string, rc: string): Promise<{
        reset: boolean;
        defaults: Record<string, string[]>;
    }>;
    getDefaults(): Record<string, Record<string, string[]>>;
    getModuleActions(): Record<string, string[]>;
}
