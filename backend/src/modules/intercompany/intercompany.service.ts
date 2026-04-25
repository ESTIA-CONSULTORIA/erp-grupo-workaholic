// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class IntercompanyService {
  constructor(private prisma: PrismaService) {}

  getTransfers(companyId: string, period?: string) {
    const where: any = {
      OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
    };

    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0),
      };
    }

    return this.prisma.intercompanyTransfer.findMany({
      where,
      include: {
        fromCompany: { select: { id: true, name: true, color: true } },
        toCompany: { select: { id: true, name: true, color: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createTransfer(fromCompanyId: string, userId: string, data: any) {
    const count = await this.prisma.intercompanyTransfer.count();
    const folio = `ICT-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.intercompanyTransfer.create({
      data: {
        folio,
        fromCompanyId,
        toCompanyId: data.toCompanyId,
        amount: Number(data.amount),
        currency: data.currency || 'MXN',
        concept: data.concept,
        date: new Date(data.date),
        status: 'PENDIENTE',
        requestedById: userId,
        notes: data.notes || null,
      },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany: { select: { id: true, name: true } },
      },
    });
  }

  async approveTransfer(transferId: string, userId: string, approved: boolean) {
    return this.prisma.intercompanyTransfer.update({
      where: { id: transferId },
      data: {
        status: approved ? 'APROBADO' : 'RECHAZADO',
        approvedById: userId,
        approvedAt: new Date(),
      },
    });
  }
}
  async approveTransfer(transferId: string, userId: string, approved: boolean) {
    const t = await this.prisma.intercompanyTransfer.findUnique({ where: { id: transferId } });
    if (!t) throw new Error('Transferencia no encontrada');

    const updated = await this.prisma.intercompanyTransfer.update({
      where: { id: transferId },
      data: { status: approved ? 'APROBADO' : 'RECHAZADO', approvedById: userId, approvedAt: new Date() },
      include: { fromCompany: { select: { id:true, name:true } }, toCompany: { select: { id:true, name:true } } },
    });

    if (approved) {
      const ref = t.folio || transferId.slice(-6);
      await this.prisma.flowMovement.createMany({ data: [
        { companyId: t.fromCompanyId, type: 'EGRESO',  amount: t.amount,
          concept: `Intercompany salida: ${ref} — ${t.concept}`,
          date: t.date, paymentMethod: 'TRANSFERENCIA', reference: ref },
        { companyId: t.toCompanyId,   type: 'INGRESO', amount: t.amount,
          concept: `Intercompany entrada: ${ref} — ${t.concept}`,
          date: t.date, paymentMethod: 'TRANSFERENCIA', reference: ref },
      ]}).catch(() => {});
    }
    return updated;
  }@ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class IntercompanyService {
  constructor(private prisma: PrismaService) {}

  getTransfers(companyId: string, period?: string) {
    const where: any = {
      OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
    };

    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0),
      };
    }

    return this.prisma.intercompanyTransfer.findMany({
      where,
      include: {
        fromCompany: { select: { id: true, name: true, color: true } },
        toCompany: { select: { id: true, name: true, color: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createTransfer(fromCompanyId: string, userId: string, data: any) {
    const count = await this.prisma.intercompanyTransfer.count();
    const folio = `ICT-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.intercompanyTransfer.create({
      data: {
        folio,
        fromCompanyId,
        toCompanyId: data.toCompanyId,
        amount: Number(data.amount),
        currency: data.currency || 'MXN',
        concept: data.concept,
        date: new Date(data.date),
        status: 'PENDIENTE',
        requestedById: userId,
        notes: data.notes || null,
      },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany: { select: { id: true, name: true } },
      },
    });
  }

  async approveTransfer(transferId: string, userId: string, approved: boolean) {
    return this.prisma.intercompanyTransfer.update({
      where: { id: transferId },
      data: {
        status: approved ? 'APROBADO' : 'RECHAZADO',
        approvedById: userId,
        approvedAt: new Date(),
      },
    });
  }
}
