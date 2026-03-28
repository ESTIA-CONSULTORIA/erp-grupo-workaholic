import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService }    from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt:    JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        companyRoles: {
          include: {
            company: true,
            role: { include: { permissions: { include: { permission: true } } } },
          },
        },
        branchRoles: {
          include: {
            branch:  true,
            role:    true,
          },
        },
      },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales incorrectas');

    return user;
  }

  async login(user: any) {
    // Construir mapa de empresas accesibles
    const companies = user.companyRoles.map((cr: any) => ({
      companyId:   cr.companyId,
      companyCode: cr.company.code,
      companyName: cr.company.name,
      color:       cr.company.color,
      roleCode:    cr.role.code,
      permissions: cr.role.permissions.map((rp: any) => rp.permission.code),
    }));

    const branches = user.branchRoles.map((br: any) => ({
      branchId:   br.branchId,
      branchCode: br.branch.code,
      branchName: br.branch.name,
      roleCode:   br.role.code,
    }));

    // Permisos globales (unión de todos los roles)
    const allPermissions = [...new Set(
      companies.flatMap((c: any) => c.permissions)
    )];

    const payload = {
      sub:         user.id,
      email:       user.email,
      name:        user.name,
      companies,
      branches,
      permissions: allPermissions,
    };

    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id:          user.id,
        email:       user.email,
        name:        user.name,
        companies,
        branches,
        permissions: allPermissions,
      },
    };
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, phone: true, isActive: true,
        companyRoles: {
          include: {
            company: { select: { id: true, code: true, name: true, color: true } },
            role:    { select: { code: true, name: true } },
          },
        },
      },
    });
  }
}
