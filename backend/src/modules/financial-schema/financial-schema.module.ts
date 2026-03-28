// ─── financial-schema.module.ts ───────────────────────────────
import { Module }                    from '@nestjs/common';
import { FinancialSchemaService }    from './financial-schema.service';
import { FinancialSchemaController } from './financial-schema.controller';

@Module({
  providers:   [FinancialSchemaService],
  controllers: [FinancialSchemaController],
  exports:     [FinancialSchemaService],
})
export class FinancialSchemaModule {}

// ─── financial-schema.service.ts ─────────────────────────────
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FinancialSchemaService {
  constructor(private prisma: PrismaService) {}

  // Obtener esquema completo con secciones, grupos y rubros
  async getSchema(companyId: string) {
    const schema = await this.prisma.financialSchema.findUnique({
      where: { companyId },
      include: {
        sections: {
          include: {
            groups: {
              include: {
                rubrics: {
                  where:   { isActive: true },
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!schema) throw new NotFoundException('Esquema financiero no configurado para esta empresa');
    return schema;
  }

  // Obtener solo rubros de ingresos (para formulario de cortes)
  async getRubricsForCuts(companyId: string) {
    const schema = await this.prisma.financialSchema.findUnique({ where: { companyId } });
    if (!schema) return [];

    return this.prisma.financialRubric.findMany({
      where: {
        isActive: true,
        group: {
          section: {
            schemaId: schema.id,
            code: 'INGRESOS',
          },
        },
      },
      include: {
        group: {
          include: { section: true },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  // Obtener rubros de gastos (para formulario de gastos)
  async getRubricsForExpenses(companyId: string) {
    const schema = await this.prisma.financialSchema.findUnique({ where: { companyId } });
    if (!schema) return [];

    return this.prisma.financialRubric.findMany({
      where: {
        isActive: true,
        group: {
          section: {
            schemaId: schema.id,
            code: { in: ['GASTOS_GENERALES', 'OBLIGACIONES'] },
          },
        },
      },
      include: {
        group: {
          include: { section: true },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  // Actualizar nombre visible de un rubro (sin cambiar la lógica)
  async updateRubricName(rubricId: string, name: string) {
    return this.prisma.financialRubric.update({
      where: { id: rubricId },
      data:  { name },
    });
  }

  // Crear nuevo rubro en un grupo existente
  async createRubric(groupId: string, data: {
    code: string;
    name: string;
    order: number;
    rubricType: string;
    allowsContado?: boolean;
    allowsCxC?: boolean;
    requiresClient?: boolean;
    affectsGrossSale?: boolean;
    affectsNetSale?: boolean;
    affectsFlow?: boolean;
    affectsCxC?: boolean;
    affectsResult?: boolean;
  }) {
    return this.prisma.financialRubric.create({
      data: { groupId, ...data },
    });
  }

  // Crear subcuenta (sub-grupo dentro de un grupo existente)
  async createSubGroup(sectionId: string, data: {
    code: string;
    name: string;
    order: number;
  }) {
    return this.prisma.financialGroup.create({
      data: { sectionId, ...data },
    });
  }

  // Reordenar rubros dentro de un grupo
  async reorderRubrics(rubrics: { id: string; order: number }[]) {
    const updates = rubrics.map(r =>
      this.prisma.financialRubric.update({
        where: { id: r.id },
        data:  { order: r.order },
      })
    );
    return this.prisma.$transaction(updates);
  }

  // Activar / desactivar rubro
  async toggleRubric(rubricId: string, isActive: boolean) {
    return this.prisma.financialRubric.update({
      where: { id: rubricId },
      data:  { isActive },
    });
  }
}

// ─── financial-schema.controller.ts ──────────────────────────
import { Controller, Get, Put, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard }       from '../auth/auth.guards';
import { CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Financial Schema')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/schema')
export class FinancialSchemaController {
  constructor(private svc: FinancialSchemaService) {}

  @Get()
  getSchema(@Param('companyId') companyId: string) {
    return this.svc.getSchema(companyId);
  }

  @Get('rubrics/cuts')
  getRubricsForCuts(@Param('companyId') companyId: string) {
    return this.svc.getRubricsForCuts(companyId);
  }

  @Get('rubrics/expenses')
  getRubricsForExpenses(@Param('companyId') companyId: string) {
    return this.svc.getRubricsForExpenses(companyId);
  }

  @Put('rubrics/:rubricId/name')
  updateRubricName(@Param('rubricId') id: string, @Body() body: { name: string }) {
    return this.svc.updateRubricName(id, body.name);
  }

  @Post('groups/:groupId/rubrics')
  createRubric(@Param('groupId') groupId: string, @Body() body: any) {
    return this.svc.createRubric(groupId, body);
  }

  @Put('rubrics/:rubricId/toggle')
  toggleRubric(@Param('rubricId') id: string, @Body() body: { isActive: boolean }) {
    return this.svc.toggleRubric(id, body.isActive);
  }

  @Put('rubrics/reorder')
  reorder(@Body() body: { rubrics: { id: string; order: number }[] }) {
    return this.svc.reorderRubrics(body.rubrics);
  }
}
