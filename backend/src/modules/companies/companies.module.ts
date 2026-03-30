// ─── companies.module.ts ──────────────────────────────────────
import { Module }              from '@nestjs/common';
import { CompaniesService }    from './companies.service';
import { CompaniesController } from './companies.controller';

@Module({
  providers:   [CompaniesService],
  controllers: [CompaniesController],
  exports:     [CompaniesService],
})
export class CompaniesModule {}

// ─── companies.service.ts ─────────────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  // Empresas accesibles por el usuario
  async findAllForUser(userId: string) {
    return this.prisma.company.findMany({
      where: {
        isActive: true,
        userRoles: { some: { userId } },
      },
      include: {
        branches: { where: { isActive: true } },
        _count: {
          select: {
            cuts:    true,
            clients: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        branches:    { where: { isActive: true } },
        cashAccounts:{ where: { isActive: true } },
        financialSchema: {
          include: {
            sections: {
              include: {
                groups: {
                  include: { rubrics: { where: { isActive: true } } },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
    if (!company) throw new NotFoundException('Empresa no encontrada');
    return company;
  }

  async update(id: string, data: any) {
    return this.prisma.company.update({ where: { id }, data });
  }

  // Asignar usuario a empresa con rol
  async assignUser(companyId: string, userId: string, roleId: string) {
    return this.prisma.userCompanyRole.upsert({
      where: { userId_companyId: { userId, companyId } },
      update: { roleId },
      create: { userId, companyId, roleId },
    });
  }

  async removeUser(companyId: string, userId: string) {
    return this.prisma.userCompanyRole.delete({
      where: { userId_companyId: { userId, companyId } },
    });
  }

  async getUsers(companyId: string) {
    return this.prisma.userCompanyRole.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        role: true,
      },
    });
  }
}

// ─── companies.controller.ts ──────────────────────────────────
import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard }       from '../auth/auth.guards';
import { CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private svc: CompaniesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.svc.findAllForUser(req.user.sub);
  }

  @UseGuards(CompanyAccessGuard)
  @Get(':companyId')
  findOne(@Param('companyId') id: string) {
    return this.svc.findOne(id);
  }

  @UseGuards(CompanyAccessGuard)
  @Put(':companyId')
  update(@Param('companyId') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @UseGuards(CompanyAccessGuard)
  @Get(':companyId/users')
  getUsers(@Param('companyId') id: string) {
    return this.svc.getUsers(id);
  }

  @UseGuards(CompanyAccessGuard)
  @Post(':companyId/users')
  assignUser(@Param('companyId') id: string, @Body() body: any) {
    return this.svc.assignUser(id, body.userId, body.roleId);
  }

  @UseGuards(CompanyAccessGuard)
  @Delete(':companyId/users/:userId')
  removeUser(@Param('companyId') cId: string, @Param('userId') uId: string) {
    return this.svc.removeUser(cId, uId);
  }
}
