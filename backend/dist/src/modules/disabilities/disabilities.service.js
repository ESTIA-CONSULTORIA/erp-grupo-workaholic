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
exports.DisabilitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let DisabilitiesService = class DisabilitiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getByEmployee(companyId, employeeId) { return this.prisma.disability.findMany({ where: { companyId, employeeId }, orderBy: { startDate: 'desc' } }); }
    async create(companyId, data) {
        const d = await this.prisma.disability.create({ data: {
                companyId, employeeId: data.employeeId, type: data.type,
                startDate: new Date(data.startDate), endDate: new Date(data.endDate),
                days: data.days, folio: data.folio || null, documentUrl: data.documentUrl || null,
                subsidioIMSS: data.subsidioIMSS || null, pagoPatronal: data.pagoPatronal || null,
                status: 'REGISTRADA', notes: data.notes || null,
            } });
        await this.prisma.hrIncident.create({ data: {
                companyId, employeeId: data.employeeId, type: 'INCAPACIDAD',
                dateFrom: new Date(data.startDate), dateTo: new Date(data.endDate),
                quantity: data.days, unit: 'DIAS', affectsPayroll: true, affectsAttendance: true,
                sourceModule: 'disabilities', sourceId: d.id, status: 'PENDIENTE',
            } });
        return d;
    }
    update(id, data) { return this.prisma.disability.update({ where: { id }, data }); }
    validate(id, hrId) { return this.prisma.disability.update({ where: { id }, data: { status: 'VALIDADA' } }); }
};
exports.DisabilitiesService = DisabilitiesService;
exports.DisabilitiesService = DisabilitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DisabilitiesService);
//# sourceMappingURL=disabilities.service.js.map