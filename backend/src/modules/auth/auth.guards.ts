// strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      cfg.get('JWT_SECRET', 'dev-secret-change-in-production'),
    });
  }
  async validate(payload: any) { return payload; }
}

// ─── strategies/local.strategy.ts ────────────────────────────
// (Para uso futuro con Passport local)
import { Strategy as LocalStr } from 'passport-local';
@Injectable()
export class LocalStrategy extends PassportStrategy(LocalStr) {
  constructor(private auth: any) {
    super({ usernameField: 'email' });
  }
  async validate(email: string, password: string) {
    return this.auth.validateUser(email, password);
  }
}

// ─── guards/jwt-auth.guard.ts ─────────────────────────────────
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// ─── guards/permissions.guard.ts ─────────────────────────────
import {
  CanActivate, ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RequirePermission = (...perms: string[]) =>
  (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata('permissions', perms, descriptor?.value ?? target);
    return descriptor ?? target;
  };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required: string[] = this.reflector.get('permissions', ctx.getHandler()) ?? [];
    if (!required.length) return true;

    const { user } = ctx.switchToHttp().getRequest();
    const userPerms: string[] = user?.permissions ?? [];

    const hasAll = required.every(p => userPerms.includes(p));
    if (!hasAll) throw new ForbiddenException('No tienes permiso para esta acción');
    return true;
  }
}

// ─── guards/company-access.guard.ts ──────────────────────────
// Verifica que el usuario tenga acceso a la empresa del request
@Injectable()
export class CompanyAccessGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    const companyId: string = req.params.companyId || req.body.companyId;

    if (!companyId) return true; // rutas sin empresa específica

    const hasAccess = user.companies?.some((c: any) => c.companyId === companyId);
    if (!hasAccess) throw new ForbiddenException('No tienes acceso a esta empresa');
    return true;
  }
}
