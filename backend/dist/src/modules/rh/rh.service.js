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
const LFT_VACATION_DAYS = [0, 12, 14, 16, 18, 20, 22, 22, 22, 22, 22,
    24, 24, 24, 24, 24, 26, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 32];
const DIAS_FESTIVOS_MX = [
    '01-01', '02-05', '03-21', '05-01', '09-16', '11-02', '11-20', '12-25',
];
function calcBusinessDays(start, end, workDays = 6) {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
        const dow = cur.getDay();
        const mmdd = `${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        const esFestivo = DIAS_FESTIVOS_MX.includes(mmdd);
        const esDomingo = dow === 0;
        const esSabado = dow === 6;
        if (!esDomingo && !esFestivo && !(workDays === 5 && esSabado))
            count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}
function lftVacationDays(yearsWorked) {
    const idx = Math.min(yearsWorked, LFT_VACATION_DAYS.length - 1);
    return LFT_VACATION_DAYS[Math.max(0, idx)];
}
let RhService = class RhService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(companyId, userId) {
        const rows = await this.prisma.$queryRaw `
      SELECT id FROM employees 
      WHERE "companyId" = ${companyId} AND "userId" = ${userId}
      LIMIT 1
    `;
        if (!rows || rows.length === 0)
            return null;
        const empId = rows[0].id;
        const emp = await this.prisma.employee.findUnique({
            where: { id: empId },
            include: {
                documents: { orderBy: { createdAt: 'desc' } },
                vacations: { orderBy: { startDate: 'desc' } },
                hrEvents: { orderBy: { date: 'desc' } },
            },
        });
        if (!emp)
            return null;
        const balance = await this.getVacationBalance(emp.id);
        return { ...emp, vacationBalance: balance };
    }
    async linkUserToEmployee(employeeId, userId) {
        if (userId) {
            await this.prisma.$executeRaw `
        UPDATE employees SET "userId" = NULL 
        WHERE "userId" = ${userId} AND id != ${employeeId}
      `;
        }
        await this.prisma.$executeRaw `
      UPDATE employees SET "userId" = ${userId} WHERE id = ${employeeId}
    `;
        return this.prisma.employee.findUnique({ where: { id: employeeId } });
    }
    getDashboard(companyId) {
        return Promise.all([
            this.prisma.employee.count({ where: { companyId } }),
            this.prisma.employee.count({ where: { companyId, status: 'ACTIVO' } }),
            this.prisma.vacationRequest.count({ where: { companyId, status: { in: ['PENDIENTE', 'APROBADO_JEFE'] } } }),
        ]).then(([total, active, pendingVacations]) => ({
            totalEmployees: total, activeEmployees: active, onLeave: 0,
            pendingVacations, expiringContracts: [],
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
    async getRequests(companyId, userId, role) {
        const where = { companyId };
        if (role === 'empleado') {
            const emp = await this.prisma.employee.findFirst({ where: { companyId } });
            where.employeeId = emp?.id;
        }
        else if (role === 'jefe') {
            where.status = { in: ['PENDIENTE', 'APROBADO_JEFE', 'APROBADO', 'RECHAZADO'] };
        }
        return this.prisma.vacationRequest.findMany({
            where,
            include: { employee: { select: { firstName: true, lastName: true, position: true, department: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createEmployee(companyId, data) {
        const count = await this.prisma.employee.count({ where: { companyId } });
        const company = await this.prisma.company.findUnique({ where: { id: companyId } });
        const prefix = company?.code.toUpperCase().slice(0, 3) || 'EMP';
        const employeeNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
        return this.prisma.employee.create({
            data: {
                companyId, employeeNumber,
                firstName: data.firstName, lastName: data.lastName,
                secondLastName: data.secondLastName || null,
                rfc: data.rfc || null, curp: data.curp || null, nss: data.nss || null,
                phone: data.phone || null, email: data.email || null,
                position: data.position, department: data.department || null,
                startDate: new Date(data.startDate),
                contractType: data.contractType || 'INDEFINIDO',
                salaryType: data.salaryType || 'MENSUAL',
                grossSalary: data.grossSalary || 0,
                dailySalary: data.dailySalary || data.grossSalary / 30,
                bankAccount: data.bankAccount || null, bankName: data.bankName || null,
                status: 'ACTIVO',
            },
        });
    }
    getDocuments(employeeId) {
        return this.prisma.employeeDocument.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
    }
    addDocument(companyId, employeeId, userId, data) {
        return this.prisma.employeeDocument.create({
            data: {
                companyId, employeeId, uploadedById: userId,
                type: data.type, title: data.title, fileUrl: data.fileUrl || null,
                fileName: data.fileName || null,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                signedAt: data.signedAt ? new Date(data.signedAt) : null,
                notes: data.notes || null, status: 'VIGENTE',
            },
        });
    }
    getMissingDocuments(employeeId) {
        const required = ['INE', 'CURP', 'NSS', 'RFC', 'CONTRATO', 'ALTA_IMSS'];
        return this.prisma.employeeDocument.findMany({
            where: { employeeId, status: 'VIGENTE' }, select: { type: true },
        }).then(existing => {
            const types = existing.map(d => d.type);
            return required.filter(t => !types.includes(t));
        });
    }
    async getVacationBalance(employeeId) {
        const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        if (!emp)
            return { years: 0, entitled: 0, businessDays: 0, used: 0, balance: 0, primaVacacional: 0, workDays: 6 };
        const years = Math.floor((Date.now() - new Date(emp.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const entitled = lftVacationDays(years);
        const deptAdmin = ['administracion', 'administración', 'admin', 'finanzas', 'rh', 'recursos humanos', 'contabilidad'];
        const dept = (emp.department || '').toLowerCase();
        const workDays = deptAdmin.some(d => dept.includes(d)) ? 5 : 6;
        const used = await this.prisma.vacationRequest.aggregate({
            where: { employeeId, status: 'APROBADO', type: 'VACACIONES' },
            _sum: { days: true },
        });
        const usedDays = used._sum.days || 0;
        const dailySalary = Number(emp.dailySalary || 0);
        const primaVacacional = dailySalary * entitled * 0.25;
        return { years, entitled, businessDays: entitled, used: usedDays, balance: entitled - usedDays, primaVacacional, workDays, department: emp.department };
    }
    async requestVacation(companyId, employeeId, userId, data) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
        const deptAdmin = ['administracion', 'administración', 'admin', 'finanzas', 'rh', 'recursos humanos', 'contabilidad'];
        const dept = (emp?.department || '').toLowerCase();
        const workDays = deptAdmin.some(d => dept.includes(d)) ? 5 : 6;
        const businessDays = calcBusinessDays(start, end, workDays);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        const dailySalary = Number(emp?.dailySalary || 0);
        const type = data.type || 'VACACIONES';
        const conGoce = data.conGoce !== undefined ? data.conGoce : true;
        const primaVacacional = type === 'VACACIONES' ? dailySalary * businessDays * 0.25 : null;
        const id = `vac_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        await this.prisma.$executeRaw `
      INSERT INTO vacation_requests 
        (id, "companyId", "employeeId", type, "startDate", "endDate", days, 
         "businessDays", "primaVacacional", "conGoce", status, "requestedById", notes, "createdAt")
      VALUES 
        (${id}, ${companyId}, ${employeeId}, ${type}, ${start}, ${end}, ${totalDays},
         ${businessDays}, ${primaVacacional || null}, ${conGoce}, 'PENDIENTE', ${userId}, ${data.notes || null}, NOW())
    `;
        return this.prisma.vacationRequest.findUnique({ where: { id } });
    }
    async approveVacation(id, userId, role, approved, reason) {
        const req = await this.prisma.vacationRequest.findUnique({ where: { id } });
        if (!req)
            throw new Error('Solicitud no encontrada');
        if (role === 'jefe' || role === 'gerente') {
            if (!approved) {
                await this.prisma.$executeRaw `UPDATE vacation_requests SET status='RECHAZADO', "approvedByJefe"=${userId}, "rejectedReason"=${reason || null} WHERE id=${id}`;
            }
            else {
                await this.prisma.$executeRaw `UPDATE vacation_requests SET status='APROBADO_JEFE', "approvedByJefe"=${userId} WHERE id=${id}`;
            }
            return this.prisma.vacationRequest.findUnique({ where: { id } });
        }
        if (!approved) {
            await this.prisma.$executeRaw `UPDATE vacation_requests SET status='RECHAZADO', "approvedByRH"=${userId}, "rejectedReason"=${reason || null} WHERE id=${id}`;
        }
        else {
            await this.prisma.$executeRaw `UPDATE vacation_requests SET status='APROBADO', "approvedByRH"=${userId}, "approvedAt"=NOW() WHERE id=${id}`;
        }
        return this.prisma.vacationRequest.findUnique({ where: { id } });
    }
    updateEmployee(id, data) {
        const { id: _id, companyId: _c, createdAt: _ca, updatedAt: _ua, documents: _d, vacations: _v, hrEvents: _e, payrollLines: _p, ...updateData } = data;
        return this.prisma.employee.update({
            where: { id },
            data: {
                ...updateData,
                grossSalary: updateData.grossSalary ? Number(updateData.grossSalary) : undefined,
                dailySalary: updateData.dailySalary ? Number(updateData.dailySalary) : undefined,
                endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
            },
        });
    }
    updateVacation(id, data) {
        return this.prisma.vacationRequest.update({ where: { id }, data });
    }
    getEvents(employeeId) {
        return this.prisma.hREvent.findMany({ where: { employeeId }, orderBy: { date: 'desc' } });
    }
    createEvent(companyId, employeeId, userId, data) {
        return this.prisma.hREvent.create({
            data: { companyId, employeeId, createdById: userId, type: data.type,
                date: new Date(data.date), description: data.description, resolution: data.resolution || null },
        });
    }
    getHRConfig(companyId) {
        return this.prisma.companyHRConfig.findUnique({ where: { companyId } });
    }
    upsertHRConfig(companyId, data) {
        return this.prisma.companyHRConfig.upsert({
            where: { companyId }, update: data, create: { companyId, ...data },
        });
    }
};
exports.RhService = RhService;
exports.RhService = RhService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RhService);
//# sourceMappingURL=rh.service.js.map