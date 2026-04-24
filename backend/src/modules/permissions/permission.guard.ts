// @ts-nocheck
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from './permissions.service';

export const PERMISSION_KEY = 'permission';

export function RequirePermission(module: string, action: string) {
  return (target: any, key?: string, descriptor?: any) => {
    if (descriptor) {
      Reflect.defineMetadata(PERMISSION_KEY, { module, action }, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(PERMISSION_KEY, { module, action }, target);
    return target;
  };
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<{module:string;action:string}>(
      PERMISSION_KEY,
      ctx.getHandler(),
    );

    // No permission required — allow
    if (!permission) return true;

    const req      = ctx.switchToHttp().getRequest();
    const user     = req.user;
    if (!user) throw new ForbiddenException('No autenticado');

    const roleCode  = user.roleCode || user.role || 'cajero';
    const companyId = req.params?.companyId || null;

    // Admin always has access
    if (roleCode === 'admin' || roleCode === 'administrador') return true;

    const allowed = await this.permissionsService.can(
      roleCode, permission.module, permission.action, companyId,
    );

    if (!allowed) {
      throw new ForbiddenException(
        `No tienes permiso para ${permission.action} en ${permission.module}`
      );
    }

    return true;
  }
}
