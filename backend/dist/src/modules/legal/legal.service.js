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
exports.LegalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const TEMPLATES = {
    CARTA_TRABAJO: `Por medio del presente, {{companyName}} hace constar que {{employeeName}}, con RFC {{rfc}}, labora en esta empresa desde el {{startDate}} desempeñando el puesto de {{position}} con un salario mensual de ${{ salary }}. Se expide a petición del interesado el día {{today}}.`,
    FINIQUITO: `En la ciudad de {{city}}, a {{today}}, entre {{companyName}} y C. {{employeeName}}, se celebra el presente convenio de finiquito. El trabajador recibe la cantidad de ${{ totalFiniquito }} como liquidación total de sus prestaciones laborales, sin que exista reclamación pendiente entre las partes.`,
    RENUNCIA: `Por medio de la presente, yo {{employeeName}} manifiesto mi deseo de separarme de mi puesto como {{position}} en {{companyName}}, con efectividad al {{terminationDate}}. Solicito se me extienda el finiquito correspondiente.`,
};
let LegalService = class LegalService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getByEmployee(companyId, employeeId) {
        return this.prisma.legalDocument.findMany({ where: { companyId, employeeId }, orderBy: { createdAt: 'desc' } });
    }
    async generate(companyId, userId, data) {
        const emp = await this.prisma.employee.findUnique({
            where: { id: data.employeeId }, include: { company: true },
        });
        if (!emp)
            throw new Error('Empleado no encontrado');
        const template = TEMPLATES[data.type] || '';
        const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
        const content = template
            .replace(/{{employeeName}}/g, `${emp.firstName} ${emp.lastName}`)
            .replace(/{{companyName}}/g, emp.company?.name || companyId)
            .replace(/{{rfc}}/g, emp.rfc || 'NO REGISTRADO')
            .replace(/{{startDate}}/g, new Date(emp.startDate).toLocaleDateString('es-MX'))
            .replace(/{{position}}/g, emp.position)
            .replace(/{{salary}}/g, Number(emp.grossSalary).toLocaleString('es-MX'))
            .replace(/{{today}}/g, today)
            .replace(/{{city}}/g, data.city || 'Monterrey, N.L.')
            .replace(/{{terminationDate}}/g, data.terminationDate || today)
            .replace(/{{totalFiniquito}}/g, data.totalFiniquito || '0');
        return this.prisma.legalDocument.create({ data: {
                companyId, employeeId: data.employeeId,
                terminationId: data.terminationId || null,
                type: data.type, title: data.title || data.type,
                content: { text: content, variables: data },
                generatedAt: new Date(), generatedById: userId,
                status: 'GENERADO',
                documentNumber: `DOC-${Date.now()}`,
            } });
    }
    update(id, data) { return this.prisma.legalDocument.update({ where: { id }, data }); }
    sign(id, userId, byEmployee) {
        const field = byEmployee ? { signedByEmployeeAt: new Date() } : { signedByCompanyAt: new Date(), signedById: userId, status: 'FIRMADO' };
        return this.prisma.legalDocument.update({ where: { id }, data: field });
    }
};
exports.LegalService = LegalService;
exports.LegalService = LegalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LegalService);
//# sourceMappingURL=legal.service.js.map