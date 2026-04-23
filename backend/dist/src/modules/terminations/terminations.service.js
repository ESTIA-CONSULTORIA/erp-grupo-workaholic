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
exports.TerminationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let TerminationsService = class TerminationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getByCompany(companyId) {
        return this.prisma.employeeTermination.findMany({
            where: { companyId }, include: { employee: { select: { firstName: true, lastName: true, employeeNumber: true, startDate: true } }, legalDocuments: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.employeeTermination.findUnique({
            where: { id }, include: { employee: true, legalDocuments: true },
        });
    }
    async create(companyId, userId, data) {
        const emp = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
        if (!emp)
            throw new Error('Empleado no encontrado');
        const startDate = new Date(emp.startDate);
        const termDate = new Date(data.terminationDate);
        const diasLaborados = Math.floor((termDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const dailySalary = Number(emp.dailySalary || 0);
        const years = Math.floor(diasLaborados / 365);
        const vacDays = this._lftVacDays(years);
        const vacsPendientes = (vacDays / 365) * (diasLaborados % 365) / 12;
        const partes = dailySalary * (diasLaborados % 365) / 365 * 15;
        const primaAntig = data.type === 'RENUNCIA_VOLUNTARIA' && years >= 15 ? dailySalary * 12 * years * 0.12 : 0;
        const indemnizacion = data.type === 'DESPIDO_INJUSTIFICADO_PRESUNTO' ? dailySalary * 90 + dailySalary * 20 * years : 0;
        const totalFiniquito = (vacsPendientes * dailySalary) + partes + primaAntig + indemnizacion;
        const t = await this.prisma.employeeTermination.create({ data: {
                companyId, employeeId: data.employeeId, type: data.type,
                reason: data.reason || null,
                terminationDate: new Date(data.terminationDate),
                lastWorkDay: new Date(data.lastWorkDay || data.terminationDate),
                notificationDate: data.notificationDate ? new Date(data.notificationDate) : null,
                diasLaborados, vacacionesPendientes: vacsPendientes,
                partesProporcionales: partes, primaAntiguedad: primaAntig,
                indemnizacion, totalFiniquito,
                status: 'BORRADOR', notes: data.notes || null,
            } });
        return t;
    }
    update(id, data) { return this.prisma.employeeTermination.update({ where: { id }, data }); }
    async submitForApproval(id, userId, roleCode) {
        const t = await this.findOne(id);
        const req = await this.prisma.approvalRequest.create({ data: {
                companyId: t.companyId, type: 'BAJA', entityId: id, entityType: 'EmployeeTermination',
                requestedById: userId, requestedByRole: roleCode,
                priority: 'ALTA', status: 'PENDIENTE', currentStep: 1,
                metadata: { employeeName: `${t.employee?.firstName} ${t.employee?.lastName}`, type: t.type, totalFiniquito: t.totalFiniquito },
            } });
        await this.prisma.approvalStep.createMany({ data: [
                { requestId: req.id, stepOrder: 1, stepType: 'SEQUENTIAL', roleRequired: 'rh', status: 'PENDIENTE' },
                { requestId: req.id, stepOrder: 2, stepType: 'SEQUENTIAL', roleRequired: 'administrador', status: 'PENDIENTE' },
            ] });
        await this.prisma.employeeTermination.update({ where: { id }, data: { approvalRequestId: req.id, status: 'EN_REVISION_RH' } });
        return req;
    }
    _lftVacDays(years) {
        const t = [12, 14, 16, 18, 20];
        if (years <= 0)
            return 12;
        if (years <= 5)
            return t[years - 1] || 20;
        return 20 + Math.floor((years - 5) / 5) * 2;
    }
};
exports.TerminationsService = TerminationsService;
exports.TerminationsService = TerminationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TerminationsService);
//# sourceMappingURL=terminations.service.js.map