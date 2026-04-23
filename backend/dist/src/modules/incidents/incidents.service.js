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
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let IncidentsService = class IncidentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getByEmployee(companyId, employeeId) {
        return this.prisma.hrIncident.findMany({ where: { companyId, employeeId }, orderBy: { createdAt: 'desc' } });
    }
    getByPeriod(companyId, periodId) {
        return this.prisma.hrIncident.findMany({ where: { companyId, payrollPeriodId: periodId, affectsPayroll: true }, include: { employee: { select: { firstName: true, lastName: true, employeeNumber: true } } } });
    }
    create(companyId, userId, data) {
        return this.prisma.hrIncident.create({ data: {
                companyId, employeeId: data.employeeId, type: data.type,
                dateFrom: new Date(data.dateFrom), dateTo: new Date(data.dateTo || data.dateFrom),
                date: data.date ? new Date(data.date) : null, quantity: data.quantity || 1,
                unit: data.unit || 'DIAS', amount: data.amount || null,
                calculationMode: data.calculationMode || 'DAILY',
                conceptCode: data.conceptCode || null,
                affectsPayroll: data.affectsPayroll !== false,
                affectsAttendance: data.affectsAttendance !== false,
                payrollPeriodId: data.payrollPeriodId || null,
                sourceModule: data.sourceModule || 'manual',
                sourceId: data.sourceId || null,
                approvalRequestId: data.approvalRequestId || null,
                evidenceUrl: data.evidenceUrl || null,
                status: data.status || 'PENDIENTE',
                notes: data.notes || null,
            } });
    }
    update(id, data) { return this.prisma.hrIncident.update({ where: { id }, data }); }
    approve(id, managerId, hrId) {
        return this.prisma.hrIncident.update({ where: { id }, data: { status: 'APROBADA', approvedByManagerId: managerId, approvedByHrId: hrId } });
    }
    applyToPayroll(id, payrollId) {
        return this.prisma.hrIncident.update({ where: { id }, data: { status: 'APLICADA', appliedInPayrollId: payrollId } });
    }
};
exports.IncidentsService = IncidentsService;
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map