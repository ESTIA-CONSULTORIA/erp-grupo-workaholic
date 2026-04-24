import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from './permissions.service';
export declare const PERMISSION_KEY = "permission";
export declare function RequirePermission(module: string, action: string): (target: any, key?: string, descriptor?: any) => any;
export declare class PermissionGuard implements CanActivate {
    private reflector;
    private permissionsService;
    constructor(reflector: Reflector, permissionsService: PermissionsService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
