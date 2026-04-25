import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getModulesForCompany(companyCode: string): {
        key: string;
        actions: string[];
    }[];
    getRoles(companyId: string, companyCode?: string): Promise<any[]>;
    createRole(companyId: string, data: {
        label: string;
        color?: string;
        description?: string;
        copyFrom?: string;
    }): Promise<any>;
    updateRole(companyId: string, roleCode: string, data: any): Promise<any>;
    suspendRole(companyId: string, roleCode: string): Promise<any>;
    deleteRole(companyId: string, roleCode: string): Promise<any>;
    getForRole(companyId: string, roleCode: string): Promise<Record<string, string[]>>;
    getAllForCompany(companyId: string): Promise<Record<string, Record<string, string[]>>>;
    setPermission(companyId: string, roleCode: string, module: string, action: string, allowed: boolean): Promise<any>;
    resetToDefaults(companyId: string, roleCode: string): Promise<{
        reset: boolean;
        defaults: Record<string, string[]>;
    }>;
    copyPermissions(companyId: string, fromRole: string, toRole: string): Promise<Record<string, string[]>>;
    can(companyId: string, roleCode: string, module: string, action: string): Promise<boolean>;
    getModuleActions(): Record<string, string[]>;
    getDefaults(): Record<string, Record<string, string[]>>;
    private _getCompanyCode;
}
