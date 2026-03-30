import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers.authorization;
    if (!auth) return false;
    try {
      const token = auth.replace('Bearer ', '');
      req.user = this.jwt.verify(token);
      return true;
    } catch {
      return false;
    }
  }
}

@Injectable()
export class CompanyAccessGuard implements CanActivate {
  canActivate(): boolean {
    return true; // Validation done in service layer
  }
}
