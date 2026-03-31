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
exports.RhService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let RhService = class RhService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getDashboard(companyId) {
        return Promise.all([
            this.prisma.employee.count({ where: { companyId } }),
            this.prisma.employee.count({ where: { companyId, status: 'ACTIVO' } }),
            this.prisma.vacationRequest.count({ where: { companyId, status: 'PENDIENTE' } }),
        ]).then(([total, active, pendingVacations]) => ({
            totalEmployees: total,
            activeEmployees: active,
            onLeave: 0,
            pendingVacations,
            expiringContracts: [],
        }));
    }
    findAllEmployees(companyId, filters) {
        const where = { companyId };
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { firstName: { contains: filters.search, mode: 'insensitive' } },
                { lastName: { contains: filters.search, mode: 'insensitive' } },
                { position: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.employee.findMany({
            where,
            include: { branch: { select: { id: true, name: true } } },
            orderBy: [{ status: 'asc' }, { lastName: 'asc' }],
        });
    }
    findOneEmployee(id) {
        return this.prisma.employee.findUnique({
            where: { id },
            include: {
                branch: true,
                documents: { orderBy: { createdAt: 'desc' } },
                vacations: { orderBy: { startDate: 'desc' } },
                hrEvents: { orderBy: { date: 'desc' } },
            },
        });
    }
    async createEmployee(companyId, data) {
        const count = await this.prisma.employee.count({ where: { companyId } });
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const prefix = company?.code.toUpperCase().slice(0, 3) || 'EMP';
        const employeeNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
        return this.prisma.employee.create({
            data: {
                companyId,
                employeeNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                secondLastName: data.secondLastName || null,
                rfc: data.rfc || null,
                curp: data.curp || null,
                nss: data.nss || null,
                phone: data.phone || null,
                email: data.email || null,
                position: data.position,
                department: data.department || null,
                startDate: new Date(data.startDate),
                contractType: data.contractType || 'INDEFINIDO',
                salaryType: data.salaryType || 'MENSUAL',
                grossSalary: data.grossSalary || 0,
                dailySalary: data.dailySalary || data.grossSalary / 30,
                bankAccount: data.bankAccount || null,
                bankName: data.bankName || null,
                status: 'ACTIVO',
            },
        });
    }
    getDocuments(employeeId) {
        return this.prisma.employeeDocument.findMany({
            where: { employeeId },
            orderBy: { createdAt: 'desc' },
        });
    }
    addDocument(companyId, employeeId, userId, data) {
        return this.prisma.employeeDocument.create({
            data: {
                companyId,
                employeeId,
                uploadedById: userId,
                type: data.type,
                title: data.title,
                fileUrl: data.fileUrl || null,
                fileName: data.fileName || null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                signedAt: data.signedAt ? new Date(data.signedAt) : null,
                notes: data.notes || null,
                status: 'VIGENTE',
            },
        });
    }
    getMissingDocuments(employeeId) {
        const required = ['INE', 'CURP', 'NSS', 'RFC', 'CONTRATO', 'ALTA_IMSS'];
        return this.prisma.employeeDocument.findMany({
            where: { employeeId, status: 'VIGENTE' },
            select: { type: true },
        }).then(existing => {
            const types = existing.map(d => d.type);
            return required.filter(t => !types.includes(t));
        });
    }
    async getVacationBalance(employeeId) {
        const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!emp)
            return { years: 0, entitled: 0, used: 0, balance: 0 };
        const years = Math.floor((Date.now() - new Date(emp.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const entitled = years <= 0 ? 0 : years === 1 ? 12 : years === 2 ? 14 : years <= 4 ? 16 : 20;
        const used = await this.prisma.vacationRequest.aggregate({
            where: { employeeId, status: 'APROBADO', type: 'VACACIONES' },
            _sum: { days: true },
        });
        const usedDays = used._sum.days || 0;
        return { years, entitled, used: usedDays, balance: entitled - usedDays };
    }
    requestVacation(companyId, employeeId, data) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        return this.prisma.vacationRequest.create({
            data: { companyId, employeeId, startDate: start, endDate: end, days, type: data.type || 'VACACIONES', status: 'PENDIENTE' },
        });
    }
    approveVacation(id, userId, approved) {
        return this.prisma.vacationRequest.update({
            where: { id },
            data: { status: approved ? 'APROBADO' : 'RECHAZADO', approvedById: userId, approvedAt: new Date() },
        });
    }
    getEvents(employeeId) {
        return this.prisma.hREvent.findMany({ where: { employeeId }, orderBy: { date: 'desc' } });
    }
    createEvent(companyId, employeeId, userId, data) {
        return this.prisma.hREvent.create({
            data: { companyId, employeeId, createdById: userId, type: data.type, date: new Date(data.date), description: data.description, resolution: data.resolution || null },
        });
    }
    getHRConfig(companyId) {
        return this.prisma.companyHRConfig.findUnique({ where: { companyId } });
    }
    upsertHRConfig(companyId, data) {
        return this.prisma.companyHRConfig.upsert({
            where: { companyId },
            update: data,
            create: { companyId, ...data },
        });
    }
};
exports.RhService = RhService;
exports.RhService = RhService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RhService);
//# sourceMappingURL=rh.service.js.map