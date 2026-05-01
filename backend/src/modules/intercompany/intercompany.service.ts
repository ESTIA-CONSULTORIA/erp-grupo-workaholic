// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class IntercompanyService {
  constructor(private prisma: PrismaService) {}

  // ── Obtener transferencias de una empresa ───────────────────
  getTransfers(companyId: string, period?: string) {
    const where: any = {
      OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
    };
    if (period) {
      const [y, m] = period.split('-').map(Number);
      where.date = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    return this.prisma.intercompanyTransfer.findMany({
      where,
      include: {
        fromCompany: { select: { id: true, name: true, color: true } },
        toCompany:   { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Crear transferencia ─────────────────────────────────────
  async createTransfer(fromCompanyId: string, userId: string, data: any) {
    // Folio único global: ICT-0001
    const count = await this.prisma.intercompanyTransfer.count();
    const folio = `ICT-${String(count + 1).padStart(4, '0')}`;

    const transfer = await this.prisma.intercompanyTransfer.create({
      data: {
        fromCompanyId,
        toCompanyId:      data.toCompanyId,
        amount:           Number(data.amount),
        currency:         data.currency || 'MXN',
        concept:          data.concept,
        date:             new Date(data.date),
        status:           'PENDIENTE',
        requestedById:    userId,
        notes:            data.notes || null,
        // These fields may not exist if add-phase2-tables.js hasn't been run
        ...(folio ? { folio } : {}),
        ...(data.fromCashAccountId ? { fromCashAccountId: data.fromCashAccountId } : {}),
        ...(data.toCashAccountId   ? { toCashAccountId:   data.toCashAccountId   } : {}),
      } as any,
      include: {
        fromCompany: { select: { id: true, name: true, color: true } },
        toCompany:   { select: { id: true, name: true, color: true } },
      },
    });

    // ── Notificar a la empresa RECEPTORA ────────────────────────
    await this._notificarReceptores(transfer, 'NUEVA').catch(() => {});

    return transfer;
  }

  // ── Aprobar o rechazar ──────────────────────────────────────
  async approveTransfer(transferId: string, userId: string, approved: boolean, motivo?: string) {
    const t = await this.prisma.intercompanyTransfer.findUnique({
      where: { id: transferId },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany:   { select: { id: true, name: true } },
      },
    });
    if (!t) throw new Error('Transferencia no encontrada');
    if (t.status !== 'PENDIENTE') throw new Error(`La transferencia ya está ${t.status}`);

    const updated = await this.prisma.intercompanyTransfer.update({
      where: { id: transferId },
      data: {
        status:         approved ? 'APROBADO' : 'RECHAZADO',
        approvedById:   userId,
        approvedAt:     new Date(),
        rejectedReason: !approved ? (motivo || 'Rechazado') : null,
      },
      include: {
        fromCompany: { select: { id: true, name: true, color: true } },
        toCompany:   { select: { id: true, name: true, color: true } },
      },
    });

    if (approved) {
      await this._registrarMovimientos(t).catch(e => console.error('FlowMovement IC error:', e.message));
    }

    // Notificar a la empresa EMISORA del resultado
    await this._notificarEmisor(updated, approved, motivo).catch(() => {});

    return updated;
  }

  // ── Registrar FlowMovements en ambas empresas ───────────────
  private async _registrarMovimientos(t: any) {
    const ref = t.folio || t.id.slice(-6);

    // Obtener cuenta de caja por defecto si no se especificó
    const getDefaultAccount = async (companyId: string, cashAccountId?: string) => {
      if (cashAccountId) return cashAccountId;
      const acc = await this.prisma.cashAccount.findFirst({
        where: { companyId, isActive: true, type: 'BANCO' },
      }).catch(() => null);
      const fallback = await this.prisma.cashAccount.findFirst({
        where: { companyId, isActive: true },
      }).catch(() => null);
      return acc?.id || fallback?.id || null;
    };

    const fromAccId = await getDefaultAccount(t.fromCompanyId, t.fromCashAccountId);
    const toAccId   = await getDefaultAccount(t.toCompanyId,   t.toCashAccountId);

    // Obtener branchId por defecto de cada empresa
    const getBranch = async (companyId: string) => {
      const branch = await this.prisma.branch.findFirst({ where: { companyId } }).catch(() => null);
      return branch?.id || null;
    };

    const fromBranch = await getBranch(t.fromCompanyId);
    const toBranch   = await getBranch(t.toCompanyId);

    const movements: any[] = [];

    if (fromAccId && fromBranch) {
      movements.push({
        companyId:     t.fromCompanyId,
        branchId:      fromBranch,
        cashAccountId: fromAccId,
        date:          t.date,
        type:          'SALIDA',
        originType:    'TRASPASO',
        originId:      t.id,
        amount:        t.amount,
        amountMxn:     t.amount,
        currency:      t.currency || 'MXN',
        reference:     ref,
        notes:         `${ref} → ${t.toCompany?.name}: ${t.concept}`,
      });
    } else {
      console.warn(`IC: empresa origen ${t.fromCompanyId} sin cuenta/sucursal — movimiento omitido`);
    }

    if (toAccId && toBranch) {
      movements.push({
        companyId:     t.toCompanyId,
        branchId:      toBranch,
        cashAccountId: toAccId,
        date:          t.date,
        type:          'ENTRADA',
        originType:    'TRASPASO',
        originId:      t.id,
        amount:        t.amount,
        amountMxn:     t.amount,
        currency:      t.currency || 'MXN',
        reference:     ref,
        notes:         `${ref} ← ${t.fromCompany?.name}: ${t.concept}`,
      });
    } else {
      console.warn(`IC: empresa destino ${t.toCompanyId} sin cuenta/sucursal — movimiento omitido`);
    }

    if (movements.length > 0) {
      await this.prisma.flowMovement.createMany({ data: movements });
    }
    return movements.length;
  }

  // ── Notificar a receptores ──────────────────────────────────
  private async _notificarReceptores(transfer: any, tipo: string) {
    // Obtener usuarios de la empresa receptora con rol admin/contador/gerente
    const roles = await this.prisma.userCompanyRole.findMany({
      where: {
        companyId: transfer.toCompanyId,
        role: { code: { in: ['admin','administrador','contador','gerente','director'] } },
      },
      include: { user: { select: { id: true } } },
    }).catch(() => []);

    if (!roles.length) return;

    await this.prisma.notification.createMany({
      data: roles.map((r: any) => ({
        companyId: transfer.toCompanyId,
        userId:    r.user.id,
        type:      'INTERCOMPANY',
        title:     `Nueva transferencia: ${transfer.folio}`,
        body:      `${transfer.fromCompany?.name} solicita transferir ${transfer.currency} ${Number(transfer.amount).toFixed(2)} — "${transfer.concept}". Revisa y valida o rechaza.`,
        actionUrl: '/intercompany',
        priority:  'HIGH',
        channel:   'IN_APP',
      })),
      skipDuplicates: true,
    }).catch(() => {});
  }

  // ── Notificar al emisor del resultado ──────────────────────
  private async _notificarEmisor(transfer: any, approved: boolean, motivo?: string) {
    const roles = await this.prisma.userCompanyRole.findMany({
      where: {
        companyId: transfer.fromCompanyId,
        role: { code: { in: ['admin','administrador','contador','gerente','director'] } },
      },
      include: { user: { select: { id: true } } },
    }).catch(() => []);

    if (!roles.length) return;

    await this.prisma.notification.createMany({
      data: roles.map((r: any) => ({
        companyId: transfer.fromCompanyId,
        userId:    r.user.id,
        type:      'INTERCOMPANY',
        title:     approved
          ? `✅ ${transfer.folio} aprobada por ${transfer.toCompany?.name}`
          : `❌ ${transfer.folio} rechazada por ${transfer.toCompany?.name}`,
        body: approved
          ? `La transferencia de ${transfer.currency} ${Number(transfer.amount).toFixed(2)} fue aprobada y registrada en ambas empresas.`
          : `Motivo: ${motivo || 'Sin motivo especificado'}`,
        actionUrl: '/intercompany',
        priority:  'HIGH',
        channel:   'IN_APP',
      })),
      skipDuplicates: true,
    }).catch(() => {});
  }
}
