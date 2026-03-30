import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        companyAccess: {
          include: {
            company: true,
            role: { include: { permissions: { include: { permission: true } } } },
          },
        },
      },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const companies = user.companyAccess.map((ca) => ({
      companyId:   ca.company.id,
      companyCode: ca.company.code,
      companyName: ca.company.name,
      color:       ca.company.color,
      roleCode:    ca.role.code,
      permissions: ca.role.permissions.map((rp) => rp.permission.code),
    }));

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id:          user.id,
        email:       user.email,
        name:        user.name,
        companies,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
