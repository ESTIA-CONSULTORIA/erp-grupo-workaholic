// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, roleCode: string, data: any) {
    const req = await this.prisma.approvalRequest.create({
      data: {
        companyId, type: data.type, entityId: data.entityId || null,
        entityType: data.entityType || null, requestedById: userId,
        requestedByRole: roleCode, priority: data.priority || 'NORMAL',
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        metadata: data.metadata || null, status: 'PENDIENTE', currentStep: 1,
      },
    });
    const steps = this._getStepsForType(data.type, data.steps);
    for (const step of steps) {
      await this.prisma.approvalStep.create({ data: { requestId: req.id, ...step } });
    }
    await this._notifyStep(req.id, 1);
    return this.findOne(req.id);
  }

  findOne(id: string) {
    return this.prisma.approvalRequest.findUnique({
      where: { id },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
  }

  getByCompany(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.type)   where.type   = filters.type;
    if (filters.status) where.status = filters.status;
    return this.prisma.approvalRequest.findMany({
      where, include: { steps: { orderBy: { stepOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getPendingForUser(companyId: string, userId: string, roleCode: string) {
    return this.prisma.approvalStep.findMany({
      where: {
        status: 'PENDIENTE',
        OR: [{ approverId: userId }, { roleRequired: roleCode }],
        request: { companyId, status: { in: ['PENDIENTE','EN_REVISION'] } },
      },
      include: { request: true },
    });
  }

  async act(requestId: string, stepId: string, userId: string, approved: boolean, comment?: string) {
    const req = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId }, include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    if (!req) throw new Error('Solicitud no encontrada');

    await this.prisma.approvalStep.update({
      where: { id: stepId },
      data: { status: approved?'APROBADO':'RECHAZADO', approverId: userId, comment: comment||null, actedAt: new Date() },
    });

    if (!approved) {
      await this.prisma.approvalRequest.update({
        where: { id: requestId },
        data: { status:'RECHAZADO', rejectedAt: new Date(), rejectedReason: comment||null },
      });
      await this._notifyRequester(req, false, comment);
      await this._audit(req, userId, 'RECHAZADO');
      return { status: 'RECHAZADO' };
    }

    const currentSteps = req.steps.filter(s => s.stepOrder === req.currentStep);
    const othersApproved = currentSteps.filter(s => s.id !== stepId).every(s => s.status === 'APROBADO');
    if (!othersApproved) return { status: 'EN_REVISION' };

    const nextStep = req.steps.find(s => s.stepOrder === req.currentStep + 1);
    if (nextStep) {
      await this.prisma.approvalRequest.update({
        where: { id: requestId },
        data: { currentStep: req.currentStep + 1, status: 'EN_REVISION' },
      });
      await this._notifyStep(requestId, req.currentStep + 1);
      return { status: 'EN_REVISION' };
    }

    await this.prisma.approvalRequest.update({
      where: { id: requestId }, data: { status:'APROBADO', approvedAt: new Date() },
    });
    await this._notifyRequester(req, true);
    await this._audit(req, userId, 'APROBADO');
    await this._onApproved(req);
    return { status: 'APROBADO' };
  }

  async cancel(requestId: string, userId: string, reason: string) {
    await this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { status:'CANCELADO', cancelledAt: new Date(), cancelReason: reason },
    });
    return { status: 'CANCELADO' };
  }

  private _getStepsForType(type: string, custom?: any[]) {
    if (custom?.length) return custom;
    const d: Record<string,any[]> = {
      VACACION:    [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'gerente'},{stepOrder:2,stepType:'SEQUENTIAL',roleRequired:'rh'}],
      PERMISO:     [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'gerente'},{stepOrder:2,stepType:'SEQUENTIAL',roleRequired:'rh'}],
      INCAPACIDAD: [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'rh'}],
      BAJA:        [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'rh'},{stepOrder:2,stepType:'SEQUENTIAL',roleRequired:'administrador'}],
      FINIQUITO:   [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'rh'},{stepOrder:2,stepType:'SEQUENTIAL',roleRequired:'administrador'},{stepOrder:3,stepType:'SEQUENTIAL',roleRequired:'contador'}],
      ARQUEO:      [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'contador'}],
      GASTO:       [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'contador'}],
    };
    return d[type] || [{stepOrder:1,stepType:'SEQUENTIAL',roleRequired:'administrador'}];
  }

  private async _notifyStep(requestId: string, stepOrder: number) {
    const req = await this.prisma.approvalRequest.findUnique({
      where: { id: requestId }, include: { steps: true },
    });
    if (!req) return;
    const steps = req.steps.filter(s => s.stepOrder === stepOrder);
    for (const step of steps) {
      const users = await this.prisma.userCompanyRole.findMany({
        where: { companyId: req.companyId, role: { code: step.roleRequired } },
      });
      for (const cu of users) {
        await this.prisma.notification.create({ data: {
          companyId: req.companyId, userId: cu.userId,
          type: 'APROBACION_PENDIENTE',
          title: `Aprobación pendiente: ${req.type}`,
          body: `Tienes una solicitud de ${req.type} esperando tu aprobación.`,
          actionUrl: `/aprobaciones/${req.id}`,
          sourceModule: 'approvals', sourceId: req.id,
        }}).catch(()=>{});
      }
    }
  }

  private async _notifyRequester(req: any, approved: boolean, comment?: string) {
    await this.prisma.notification.create({ data: {
      companyId: req.companyId, userId: req.requestedById,
      type: approved ? 'APROBADO' : 'RECHAZADO',
      title: `Solicitud ${approved?'aprobada':'rechazada'}: ${req.type}`,
      body: approved ? `Tu solicitud fue aprobada.` : `Tu solicitud fue rechazada. ${comment||''}`,
      actionUrl: `/aprobaciones/${req.id}`,
      sourceModule: 'approvals', sourceId: req.id,
    }}).catch(()=>{});
  }

  private async _audit(req: any, userId: string, action: string) {
    await this.prisma.auditLog.create({ data: {
      companyId: req.companyId, userId, action, module: 'approvals',
      entityId: req.id, entityType: 'ApprovalRequest',
      description: `${action} - ${req.type}`,
    }}).catch(()=>{});
  }

  private async _onApproved(req: any) {
    if ((req.type === 'VACACION' || req.type === 'PERMISO') && req.entityId) {
      await this.prisma.$executeRaw`
        UPDATE vacation_requests SET status='APROBADO', "approvedAt"=NOW() WHERE id=${req.entityId}
      `.catch(()=>{});
    }
    if (req.type === 'BAJA' && req.entityId) {
      const t = await this.prisma.employeeTermination.findUnique({
        where: { id: req.entityId }, include: { employee: true },
      }).catch(()=>null);
      if (t?.employee?.userId) {
        await this.prisma.user.update({ where:{id:t.employee.userId}, data:{isActive:false} }).catch(()=>{});
      }
      await this.prisma.employeeTermination.update({
        where: { id: req.entityId },
        data: { status:'PENDIENTE_DOCUMENTOS', accessRevokedAt: new Date() },
      }).catch(()=>{});
    }
  }
}
