import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PermissionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getPermissions(roleCode: string, companyId?: string): Promise<Record<string, string[]>>;
    getAllPermissions(companyId?: string): Promise<Record<string, any>>;
    can(roleCode: string, module: string, action: string, companyId?: string): Promise<boolean>;
    updatePermission(roleCode: string, module: string, action: string, allowed: boolean, companyId?: string): Promise<any>;
    resetToDefaults(roleCode: string, companyId?: string): Promise<{
        reset: boolean;
        role: string;
    }>;
    getDefaultPermissions(): Record<string, Record<string, string[]>>;
}
