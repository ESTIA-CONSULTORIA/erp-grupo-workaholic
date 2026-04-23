"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let ApprovalsService = class ApprovalsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, userId, roleCode, data) {
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
    findOne(id) {
        return this.prisma.approvalRequest.findUnique({
            where: { id },
            include: { steps: { orderBy: { stepOrder: 'asc' } } },
        });
    }
    getByCompany(companyId, filters = {}) {
        const where = { companyId };
        if (filters.type)
            where.type = filters.type;
        if (filters.status)
            where.status = filters.status;
        return this.prisma.approvalRequest.findMany({
            where, include: { steps: { orderBy: { stepOrder: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    getPendingForUser(companyId, userId, roleCode) {
        return this.prisma.approvalStep.findMany({
            where: {
                status: 'PENDIENTE',
                OR: [{ approverId: userId }, { roleRequired: roleCode }],
                request: { companyId, status: { in: ['PENDIENTE', 'EN_REVISION'] } },
            },
            include: { request: true },
        });
    }
    async act(requestId, stepId, userId, approved, comment) {
        const req = await this.prisma.approvalRequest.findUnique({
            where: { id: requestId }, include: { steps: { orderBy: { stepOrder: 'asc' } } },
        });
        if (!req)
            throw new Error('Solicitud no encontrada');
        await this.prisma.approvalStep.update({
            where: { id: stepId },
            data: { status: approved ? 'APROBADO' : 'RECHAZADO', approverId: userId, comment: comment || null, actedAt: new Date() },
        });
        if (!approved) {
            await this.prisma.approvalRequest.update({
                where: { id: requestId },
                data: { status: 'RECHAZADO', rejectedAt: new Date(), rejectedReason: comment || null },
            });
            await this._notifyRequester(req, false, comment);
            await this._audit(req, userId, 'RECHAZADO');
            return { status: 'RECHAZADO' };
        }
        const currentSteps = req.steps.filter(s => s.stepOrder === req.currentStep);
        const othersApproved = currentSteps.filter(s => s.id !== stepId).every(s => s.status === 'APROBADO');
        if (!othersApproved)
            return { status: 'EN_REVISION' };
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
            where: { id: requestId }, data: { status: 'APROBADO', approvedAt: new Date() },
        });
        await this._notifyRequester(req, true);
        await this._audit(req, userId, 'APROBADO');
        await this._onApproved(req);
        return { status: 'APROBADO' };
    }
    async cancel(requestId, userId, reason) {
        await this.prisma.approvalRequest.update({
            where: { id: requestId },
            data: { status: 'CANCELADO', cancelledAt: new Date(), cancelReason: reason },
        });
        return { status: 'CANCELADO' };
    }
    _getStepsForType(type, custom) {
        if (custom?.length)
            return custom;
        const d = {
            VACACION: [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'gerente' }, { stepOrder: 2, stepType: 'SEQUENTIAL', roleRequired: 'rh' }],
            PERMISO: [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'gerente' }, { stepOrder: 2, stepType: 'SEQUENTIAL', roleRequired: 'rh' }],
            INCAPACIDAD: [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'rh' }],
            BAJA: [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'rh' }, { stepOrder: 2, stepType: 'SEQUENTIAL', roleRequired: 'administrador' }],
            FINIQUITO: [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'rh' }, { stepOrder: 2, stepType: 'SEQUENTIAL', roleRequired: 'administrador' }, { stepOrder: 3, stepType: 'SEQUENTIAL', roleRequired: 'contador' }],
            ARQUEO: [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'contador' }],
            GASTO: [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'contador' }],
        };
        return d[type] || [{ stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'administrador' }];
    }
    async _notifyStep(requestId, stepOrder) {
        const req = await this.prisma.approvalRequest.findUnique({
            where: { id: requestId }, include: { steps: true },
        });
        if (!req)
            return;
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
                    } }).catch(() => { });
            }
        }
    }
    async _notifyRequester(req, approved, comment) {
        await this.prisma.notification.create({ data: {
                companyId: req.companyId, userId: req.requestedById,
                type: approved ? 'APROBADO' : 'RECHAZADO',
                title: `Solicitud ${approved ? 'aprobada' : 'rechazada'}: ${req.type}`,
                body: approved ? `Tu solicitud fue aprobada.` : `Tu solicitud fue rechazada. ${comment || ''}`,
                actionUrl: `/aprobaciones/${req.id}`,
                sourceModule: 'approvals', sourceId: req.id,
            } }).catch(() => { });
    }
    async _audit(req, userId, action) {
        await this.prisma.auditLog.create({ data: {
                companyId: req.companyId, userId, action, module: 'approvals',
                entityId: req.id, entityType: 'ApprovalRequest',
                description: `${action} - ${req.type}`,
            } }).catch(() => { });
    }
    async _onApproved(req) {
        if ((req.type === 'VACACION' || req.type === 'PERMISO') && req.entityId) {
            await this.prisma.$executeRaw `
        UPDATE vacation_requests SET status='APROBADO', "approvedAt"=NOW() WHERE id=${req.entityId}
      `.catch(() => { });
        }
        if (req.type === 'BAJA' && req.entityId) {
            const t = await this.prisma.employeeTermination.findUnique({
                where: { id: req.entityId }, include: { employee: true },
            }).catch(() => null);
            if (t?.employee?.userId) {
                await this.prisma.user.update({ where: { id: t.employee.userId }, data: { isActive: false } }).catch(() => { });
            }
            await this.prisma.employeeTermination.update({
                where: { id: req.entityId },
                data: { status: 'PENDIENTE_DOCUMENTOS', accessRevokedAt: new Date() },
            }).catch(() => { });
        }
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map