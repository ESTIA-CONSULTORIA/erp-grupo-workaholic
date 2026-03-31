import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

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
        companyRoles: {
          include: {
            company: true,
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) throw new UnauthorizedException('Credenciales inválidas');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const companies = user.companyRoles.map((cr) => ({
      companyId:   cr.company.id,
      companyCode: cr.company.code,
      companyName: cr.company.name,
      color:       cr.company.color,
      roleCode:    cr.role.code,
      permissions: [],
    }));

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id:       user.id,
        email:    user.email,
        name:     user.name,
        companies,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}