// ─── cuts.module.ts ───────────────────────────────────────────
import { Module }          from '@nestjs/common';
import { CutsService }     from './cuts.service';
import { CutsController }  from './cuts.controller';

@Module({
  providers:   [CutsService],
  controllers: [CutsController],
  exports:     [CutsService],
})
export class CutsModule {}

// ─── cuts.service.ts ──────────────────────────────────────────
import {
  Injectable, NotFoundException,
  BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma }        from '@prisma/client';

@Injectable()
export class CutsService {
  constructor(private prisma: PrismaService) {}

  // ── Listar cortes del mes ─────────────────────────────────
  async findAll(companyId: string, filters: {
    branchId?: string;
    period?:   string;  // "2026-03"
    status?:   string;
    date?:     string;
  }) {
    const where: Prisma.CutWhereInput = { companyId };

    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.status)   where.status   = filters.status;

    if (filters.period) {
      const [y, m] = filters.period.split('-').map(Number);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m,     0),
      };
    }
    if (filters.date) where.date = new Date(filters.date);

    return this.prisma.cut.findMany({
      where,
      include: {
        branch:    { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        lines: {
          include: {
            rubric:      { select: { id: true, code: true, name: true, rubricType: true } },
            cashAccount: { select: { id: true, code: true, name: true } },
            client:      { select: { id: true, name: true } },
          },
        },
        _count: { select: { lines: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  // ── Obtener un corte con todo el detalle ──────────────────
  async findOne(id: string) {
    const cut = await this.prisma.cut.findUnique({
      where: { id },
      include: {
        branch:     true,
        createdBy:  { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true } },
        lines: {
          include: {
            rubric:      true,
            cashAccount: true,
            client:      true,
          },
          orderBy: { rubric: { order: 'asc' } },
        },
      },
    });
    if (!cut) throw new NotFoundException('Corte no encontrado');
    return cut;
  }

  // ── Crear corte nuevo ─────────────────────────────────────
  async create(companyId: string, data: {
    branchId:    string;
    date:        string;
    shift?:      string;
    notes?:      string;
    createdById: string;
    lines: {
      rubricId:      string;
      clientId?:     string;
      cashAccountId?:string;
      paymentType:   string;   // CONTADO | CXC
      currency:      string;   // MXN | USD
      exchangeRate?: number;
      grossAmount:   number;
      discount?:     number;
      courtesy?:     number;
    }[];
  }) {
    // Generar folio automático
    const folio = await this.generateFolio(companyId);

    // Calcular netAmount en cada línea
    const linesData = data.lines.map(line => {
      const discount = line.discount  || 0;
      const courtesy = line.courtesy  || 0;
      const netAmount = line.grossAmount - discount - courtesy;
      if (netAmount < 0) throw new BadRequestException(
        `La línea tiene netAmount negativo: ${netAmount}`
      );
      return {
        rubricId:      line.rubricId,
        clientId:      line.clientId      || null,
        cashAccountId: line.cashAccountId || null,
        paymentType:   line.paymentType,
        currency:      line.currency,
        exchangeRate:  line.exchangeRate  || 1,
        grossAmount:   line.grossAmount,
        discount,
        courtesy,
        netAmount,
      };
    });

    // Crear corte + líneas en una sola transacción
    const cut = await this.prisma.$transaction(async (tx) => {
      const newCut = await tx.cut.create({
        data: {
          companyId,
          branchId:    data.branchId,
          folio,
          date:        new Date(data.date),
          shift:       data.shift  || null,
          notes:       data.notes  || null,
          createdById: data.createdById,
          status:      'BORRADOR',
          lines: { create: linesData },
        },
        include: { lines: true },
      });
      return newCut;
    });

    return cut;
  }

  // ── Actualizar corte (solo si está en BORRADOR) ───────────
  async update(id: string, data: any) {
    const cut = await this.prisma.cut.findUnique({ where: { id } });
    if (!cut) throw new NotFoundException('Corte no encontrado');
    if (cut.status !== 'BORRADOR') throw new BadRequestException(
      'Solo se pueden editar cortes en estado BORRADOR'
    );

    // Eliminar líneas anteriores y recrear
    return this.prisma.$transaction(async (tx) => {
      await tx.cutLine.deleteMany({ where: { cutId: id } });

      const linesData = (data.lines || []).map((line: any) => {
        const discount  = line.discount  || 0;
        const courtesy  = line.courtesy  || 0;
        const netAmount = line.grossAmount - discount - courtesy;
        return { ...line, discount, courtesy, netAmount };
      });

      return tx.cut.update({
        where: { id },
        data: {
          date:  data.date  ? new Date(data.date) : undefined,
          shift: data.shift || undefined,
          notes: data.notes || undefined,
          lines: { create: linesData },
        },
        include: { lines: true },
      });
    });
  }

  // ── Enviar corte para aprobación ──────────────────────────
  async submit(id: string) {
    const cut = await this.prisma.cut.findUnique({ where: { id }, include: { lines: true } });
    if (!cut) throw new NotFoundException('Corte no encontrado');
    if (cut.status !== 'BORRADOR') throw new BadRequestException('El corte ya fue enviado');
    if (cut.lines.length === 0)    throw new BadRequestException('El corte no tiene líneas');

    return this.prisma.cut.update({
      where: { id },
      data:  { status: 'ENVIADO' },
    });
  }

  // ── Aprobar corte → genera flujo y CxC automáticamente ───
  async approve(id: string, approvedById: string) {
    const cut = await this.prisma.cut.findUnique({
      where:   { id },
      include: {
        lines: {
          include: { rubric: true, cashAccount: true },
        },
      },
    });
    if (!cut) throw new NotFoundException('Corte no encontrado');
    if (cut.status !== 'ENVIADO') throw new BadRequestException(
      'Solo se pueden aprobar cortes en estado ENVIADO'
    );

    return this.prisma.$transaction(async (tx) => {
      // 1. Aprobar el corte
      await tx.cut.update({
        where: { id },
        data:  { status: 'APROBADO', approvedById, approvedAt: new Date() },
      });

      // 2. Por cada línea: generar flujo o CxC según atributos del rubro
      for (const line of cut.lines) {
        const rubric = line.rubric;

        // Generar movimiento de flujo (contado)
        if (rubric.affectsFlow && line.paymentType === 'CONTADO' && line.cashAccountId) {
          const amountMxn = Number(line.netAmount) * Number(line.exchangeRate || 1);
          await tx.flowMovement.create({
            data: {
              companyId:     cut.companyId,
              branchId:      cut.branchId,
              cashAccountId: line.cashAccountId,
              date:          cut.date,
              type:          'ENTRADA',
              originType:    'CORTE',
              originId:      id,
              rubricId:      line.rubricId,
              amount:        Number(line.netAmount),
              currency:      line.currency,
              exchangeRate:  Number(line.exchangeRate || 1),
              amountMxn,
            },
          });
        }

        // Generar CxC (venta a crédito)
        if (rubric.affectsCxC && line.paymentType === 'CXC' && line.clientId) {
          await tx.receivable.create({
            data: {
              companyId:      cut.companyId,
              clientId:       line.clientId,
              cutLineId:      line.id,
              rubricId:       line.rubricId,
              date:           cut.date,
              currency:       line.currency,
              originalAmount: Number(line.grossAmount),
              paidAmount:     0,
              balance:        Number(line.grossAmount),
              status:         'PENDIENTE',
            },
          });
        }
      }

      // 3. Registrar auditoría
      await tx.auditLog.create({
        data: {
          userId:    approvedById,
          companyId: cut.companyId,
          action:    'APPROVE',
          entity:    'cuts',
          entityId:  id,
        },
      });

      return tx.cut.findUnique({ where: { id }, include: { lines: true } });
    });
  }

  // ── Rechazar corte ────────────────────────────────────────
  async reject(id: string, userId: string, reason: string) {
    return this.prisma.cut.update({
      where: { id },
      data:  { status: 'RECHAZADO', notes: reason },
    });
  }

  // ── Resumen del día por método de pago ────────────────────
  async getDailySummary(companyId: string, date: string) {
    const cuts = await this.prisma.cut.findMany({
      where: { companyId, date: new Date(date), status: 'APROBADO' },
      include: { lines: { include: { rubric: true, cashAccount: true } } },
    });

    const summary = {
      totalGross:    0,
      totalDiscount: 0,
      totalCourtesy: 0,
      totalNet:      0,
      byPaymentMethod: {} as Record<string, number>,
      byCashAccount:   {} as Record<string, { name: string; total: number }>,
      byRubric:        {} as Record<string, { name: string; contado: number; cxc: number }>,
    };

    for (const cut of cuts) {
      for (const line of cut.lines) {
        summary.totalGross    += Number(line.grossAmount);
        summary.totalDiscount += Number(line.discount);
        summary.totalCourtesy += Number(line.courtesy);
        summary.totalNet      += Number(line.netAmount);

        // Por cuenta de flujo
        if (line.cashAccount && line.paymentType === 'CONTADO') {
          const key = line.cashAccount.code;
          if (!summary.byCashAccount[key])
            summary.byCashAccount[key] = { name: line.cashAccount.name, total: 0 };
          summary.byCashAccount[key].total += Number(line.netAmount);
        }

        // Por rubro
        const rKey = line.rubricId;
        if (!summary.byRubric[rKey])
          summary.byRubric[rKey] = { name: line.rubric.name, contado: 0, cxc: 0 };
        if (line.paymentType === 'CONTADO') summary.byRubric[rKey].contado += Number(line.netAmount);
        if (line.paymentType === 'CXC')     summary.byRubric[rKey].cxc     += Number(line.netAmount);
      }
    }

    return { date, companyId, cutsCount: cuts.length, summary };
  }

  // ── Generar folio único por empresa ──────────────────────
  private async generateFolio(companyId: string): Promise<string> {
    const count = await this.prisma.cut.count({ where: { companyId } });
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const prefix = company?.code.toUpperCase().slice(0, 3) || 'ERP';
    return `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }
}

// ─── cuts.controller.ts ───────────────────────────────────────
import {
  Controller, Get, Post, Put, Param,
  Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, CompanyAccessGuard } from '../auth/auth.guards';

@ApiTags('Cuts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('companies/:companyId/cuts')
export class CutsController {
  constructor(private svc: CutsService) {}

  @Get()
  findAll(
    @Param('companyId') companyId: string,
    @Query('period')    period?:   string,
    @Query('branchId')  branchId?: string,
    @Query('status')    status?:   string,
    @Query('date')      date?:     string,
  ) {
    return this.svc.findAll(companyId, { period, branchId, status, date });
  }

  @Get('daily-summary')
  dailySummary(
    @Param('companyId') companyId: string,
    @Query('date')      date:      string,
  ) {
    return this.svc.getDailySummary(companyId, date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post()
  create(
    @Param('companyId') companyId: string,
    @Body()             body:      any,
    @Request()          req:       any,
  ) {
    return this.svc.create(companyId, { ...body, createdById: req.user.sub });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.svc.update(id, body);
  }

  @Put(':id/submit')
  submit(@Param('id') id: string) {
    return this.svc.submit(id);
  }

  @Put(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.svc.approve(id, req.user.sub);
  }

  @Put(':id/reject')
  reject(
    @Param('id') id:   string,
    @Body()      body: { reason: string },
    @Request()   req:  any,
  ) {
    return this.svc.reject(id, req.user.sub, body.reason);
  }
}
