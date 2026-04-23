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
exports.PayrollReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PayrollReceiptsService = class PayrollReceiptsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getByEmployee(companyId, employeeId) {
        return this.prisma.payrollReceipt.findMany({ where: { companyId, employeeId }, orderBy: { createdAt: 'desc' } });
    }
    getByPeriod(companyId, periodId) {
        return this.prisma.payrollReceipt.findMany({
            where: { companyId, payrollPeriodId: periodId },
            include: { employee: { select: { firstName: true, lastName: true, employeeNumber: true } } },
        });
    }
    async generate(companyId, periodId, userId) {
        const period = await this.prisma.payrollPeriod.findUnique({
            where: { id: periodId }, include: { lines: { include: { employee: true } } },
        });
        if (!period)
            throw new Error('Período no encontrado');
        const receipts = [];
        for (const line of period.lines) {
            const gross = Number(line.grossSalary || 0);
            const deductions = Number(line.imssEmployee || 0) + Number(line.isrEmployee || 0);
            const net = gross - deductions;
            const receipt = await this.prisma.payrollReceipt.create({ data: {
                    companyId, payrollPeriodId: periodId, employeeId: line.employeeId,
                    grossAmount: gross, deductions, netAmount: net,
                    breakdown: {
                        percepciones: [{ concept: 'Salario', amount: gross }],
                        deducciones: [
                            { concept: 'IMSS Empleado', amount: Number(line.imssEmployee || 0) },
                            { concept: 'ISR', amount: Number(line.isrEmployee || 0) },
                        ],
                    },
                    generatedById: userId, status: 'BORRADOR',
                } });
            receipts.push(receipt);
        }
        return receipts;
    }
    async publish(periodId, userId) {
        await this.prisma.payrollReceipt.updateMany({
            where: { payrollPeriodId: periodId, status: 'BORRADOR' },
            data: { status: 'PUBLICADO', publishedAt: new Date() },
        });
        const receipts = await this.prisma.payrollReceipt.findMany({
            where: { payrollPeriodId: periodId },
        });
        for (const r of receipts) {
            const emp = await this.prisma.employee.findUnique({ where: { id: r.employeeId } });
            if (emp?.userId) {
                await this.prisma.notification.create({ data: {
                        companyId: r.companyId, userId: emp.userId,
                        type: 'NOMINA', title: 'Recibo de nómina disponible',
                        body: 'Tu recibo de nómina ya está disponible.',
                        actionUrl: '/mi-perfil',
                        sourceModule: 'payroll-receipts', sourceId: r.id,
                    } }).catch(() => { });
            }
        }
        return { published: receipts.length };
    }
    async acknowledge(id, employeeId) {
        return this.prisma.payrollReceipt.update({
            where: { id }, data: { employeeAckAt: new Date() },
        });
    }
};
exports.PayrollReceiptsService = PayrollReceiptsService;
exports.PayrollReceiptsService = PayrollReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollReceiptsService);
//# sourceMappingURL=payroll-receipts.service.js.map