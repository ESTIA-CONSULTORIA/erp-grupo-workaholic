import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.company.findMany({ orderBy: { name: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: { branches: true },
    });
  }

  getUsers(companyId: string) {
    return this.prisma.userCompanyRole.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        role: true,
      },
    });
  }

  getClients(companyId: string) {
    return this.prisma.client.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }
  
  async createUser(companyId: string, data: any) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.upsert({
      where: { email: data.email },
      update: { name: data.name, passwordHash },
      create: { email: data.email, name: data.name, passwordHash, isActive: true },
    });

    const role = await this.prisma.role.findUnique({ where: { code: data.roleCode } });
    if (!role) throw new Error(`Rol ${data.roleCode} no encontrado`);

    const companyIds = data.companyIds?.length > 0 ? data.companyIds : [companyId];
    for (const cid of companyIds) {
      await this.prisma.userCompanyRole.upsert({
        where: { userId_companyId: { userId: user.id, companyId: cid } },
        update: { roleId: role.id },
        create: { userId: user.id, companyId: cid, roleId: role.id },
      });
    }

    return { success: true, userId: user.id, name: user.name, email: user.email };
  }

  async updateUser(userId: string, data: any) {
    const bcrypt = require('bcryptjs');
    const updateData: any = { name: data.name };
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (data.roleCode && data.companyIds?.length > 0) {
      const role = await this.prisma.role.findUnique({ where: { code: data.roleCode } });
      if (role) {
        for (const cid of data.companyIds) {
          await this.prisma.userCompanyRole.upsert({
            where: { userId_companyId: { userId: user.id, companyId: cid } },
            update: { roleId: role.id },
            create: { userId: user.id, companyId: cid, roleId: role.id },
          });
        }
      }
    }

    return { success: true, userId: user.id };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }
}
