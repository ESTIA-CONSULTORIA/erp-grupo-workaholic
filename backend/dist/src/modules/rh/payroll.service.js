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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let PayrollService = class PayrollService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getPeriods(companyId) {
        return this.prisma.payrollPeriod.findMany({
            where: { companyId },
            orderBy: { period: 'desc' },
        });
    }
    createPeriod(companyId, data) {
        return this.prisma.payrollPeriod.create({
            data: { companyId, ...data, status: 'ABIERTO' },
        });
    }
    async loadEmployees(periodId) {
        const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
        if (!period)
            throw new Error('Período no encontrado');
        const employees = await this.prisma.employee.findMany({
            where: { companyId: period.companyId, status: 'ACTIVO' },
        });
        let loaded = 0;
        for (const emp of employees) {
            const existing = await this.prisma.payrollLine.findUnique({
                where: { payrollPeriodId_employeeId: { payrollPeriodId: periodId, employeeId: emp.id } },
            });
            if (existing)
                continue;
            const baseSalary = period.type === 'QUINCENAL'
                ? Number(emp.grossSalary) / 2
                : Number(emp.grossSalary);
            const imssEmployee = baseSalary * 0.0204;
            const isrRetention = baseSalary * 0.08;
            const totalPerceptions = baseSalary;
            const totalDeductions = imssEmployee + isrRetention;
            const netPay = totalPerceptions - totalDeductions;
            await this.prisma.payrollLine.create({
                data: {
                    payrollPeriodId: periodId,
                    employeeId: emp.id,
                    companyId: period.companyId,
                    baseSalary, totalPerceptions,
                    imssEmployee, isrRetention,
                    totalDeductions, netPay,
                    imssEmployer: baseSalary * 0.0704,
                },
            });
            loaded++;
        }
        return { loaded, total: employees.length };
    }
    getLines(periodId) {
        return this.prisma.payrollLine.findMany({
            where: { payrollPeriodId: periodId },
            include: { employee: { select: { id: true, firstName: true, lastName: true, position: true, employeeNumber: true, bankAccount: true } } },
            orderBy: { employee: { lastName: 'asc' } },
        });
    }
    async updateLine(lineId, data) {
        const line = await this.prisma.payrollLine.findUnique({ where: { id: lineId } });
        if (!line)
            throw new Error('Línea no encontrada');
        const overtime = data.overtime ?? Number(line.overtime || 0);
        const bonus = data.bonus ?? Number(line.bonus || 0);
        const infonavit = data.infonavit ?? Number(line.infonavit || 0);
        const loans = data.loans ?? Number(line.loans || 0);
        const totalPerceptions = Number(line.baseSalary) + overtime + bonus;
        const isrRetention = totalPerceptions * 0.08;
        const totalDeductions = Number(line.imssEmployee) + isrRetention + infonavit + loans;
        const netPay = totalPerceptions - totalDeductions;
        return this.prisma.payrollLine.update({
            where: { id: lineId },
            data: { overtime, bonus, infonavit, loans, totalPerceptions, isrRetention, totalDeductions, netPay },
        });
    }
    async exportToContpaq(periodId) {
        const period = await this.prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: { lines: { include: { employee: true } } },
        });
        if (!period)
            throw new Error('Período no encontrado');
        const rows = ['RFC,Nombre,NumEmpleado,Concepto,TipoConcepto,Importe'];
        for (const line of period.lines) {
            const emp = line.employee;
            const name = `${emp.lastName} ${emp.firstName}`.trim();
            const rfc = emp.rfc || '';
            const num = emp.employeeNumber || '';
            if (Number(line.baseSalary) > 0)
                rows.push(`${rfc},${name},${num},001,P,${Number(line.baseSalary).toFixed(2)}`);
            if (Number(line.isrRetention) > 0)
                rows.push(`${rfc},${name},${num},080,D,${Number(line.isrRetention).toFixed(2)}`);
            if (Number(line.imssEmployee) > 0)
                rows.push(`${rfc},${name},${num},082,D,${Number(line.imssEmployee).toFixed(2)}`);
        }
        const totalNet = period.lines.reduce((t, l) => t + Number(l.netPay), 0);
        await this.prisma.payrollPeriod.update({ where: { id: periodId }, data: { status: 'EXPORTADO', exportedAt: new Date(), totalNet } });
        return {
            csv: rows.join('\n'),
            fileName: `nomina_${period.periodLabel}.csv`,
            recordCount: period.lines.length,
            totalNet,
        };
    }
    async registerPayment(periodId, cashAccountId, userId) {
        const period = await this.prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: { lines: true },
        });
        if (!period)
            throw new Error('Período no encontrado');
        const totalNet = period.lines.reduce((t, l) => t + Number(l.netPay), 0);
        const branch = await this.prisma.branch.findFirst({ where: { company: { id: period.companyId } } });
        const flow = await this.prisma.flowMovement.create({
            data: {
                companyId: period.companyId,
                branchId: branch.id,
                cashAccountId,
                date: new Date(),
                type: 'SALIDA',
                originType: 'GASTO',
                originId: periodId,
                amount: totalNet,
                currency: 'MXN',
                exchangeRate: 1,
                amountMxn: totalNet,
                notes: `Pago nómina: ${period.periodLabel}`,
            },
        });
        await this.prisma.payrollPeriod.update({
            where: { id: periodId },
            data: { status: 'PAGADO', paidAt: new Date(), paidById: userId, flowMovementId: flow.id },
        });
        return { flowMovementId: flow.id, totalNet, periodLabel: period.periodLabel };
    }
    async calculatePeriod(periodId) {
        const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
        const divisor = period?.type === 'MENSUAL' ? 1 : 2;
        const lines = await this.prisma.payrollLine.findMany({
            where: { payrollPeriodId: periodId },
            include: { employee: true },
        });
        for (const line of lines) {
            const emp = line.employee;
            const grossTotal = Number(emp.grossSalary || 0) / divisor;
            let baseTimbrado = grossTotal;
            let baseEfectivo = 0;
            const splitMode = emp.splitMode || 'TOTAL_TIMBRADO';
            if (splitMode === 'MIXTO') {
                if (emp.montoFijoTimbrado) {
                    baseTimbrado = Math.min(Number(emp.montoFijoTimbrado), grossTotal);
                }
                else if (emp.pctTimbrado) {
                    baseTimbrado = grossTotal * (Number(emp.pctTimbrado) / 100);
                }
                baseEfectivo = Math.max(0, grossTotal - baseTimbrado);
            }
            else if (splitMode === 'TOTAL_EFECTIVO') {
                baseTimbrado = 0;
                baseEfectivo = grossTotal;
            }
            const imssEmployee = baseTimbrado * 0.0204;
            const isrRetention = baseTimbrado * 0.08;
            const totalDed = imssEmployee + isrRetention +
                Number(line.infonavit || 0) + Number(line.loans || 0);
            const totalPerc = grossTotal + Number(line.overtime || 0) + Number(line.bonus || 0);
            const netPay = totalPerc - totalDed;
            const netTimbrado = Math.max(0, baseTimbrado - imssEmployee - isrRetention -
                Number(line.infonavit || 0) - Number(line.loans || 0));
            const netEfectivo = baseEfectivo;
            await this.prisma.payrollLine.update({
                where: { id: line.id },
                data: {
                    baseSalary: grossTotal,
                    baseTimbrado,
                    baseEfectivo,
                    totalPerceptions: totalPerc,
                    imssEmployee,
                    imssEmployer: baseTimbrado * 0.0704,
                    isrRetention,
                    totalDeductions: totalDed,
                    netPay: Math.max(0, netPay),
                    netTimbrado,
                    netEfectivo,
                },
            });
        }
        return { calculated: lines.length };
    }
    async closePeriod(periodId) {
        const period = await this.prisma.payrollPeriod.findUnique({ where: { id: periodId } });
        if (!period)
            throw new Error('Período no encontrado');
        if (period.status === 'CERRADO')
            throw new Error('El período ya está cerrado');
        return this.prisma.payrollPeriod.update({
            where: { id: periodId },
            data: { status: 'CERRADO' },
        });
    }
    async publishReceipts(periodId, publishedById) {
        const lines = await this.prisma.payrollLine.findMany({
            where: { payrollPeriodId: periodId },
            include: { employee: true },
        });
        let published = 0;
        for (const line of lines) {
            try {
                const existing = await this.prisma.payrollReceipt.findFirst({
                    where: { payrollPeriodId: periodId, employeeId: line.employeeId },
                });
                if (existing)
                    continue;
            }
            catch { }
            try {
                await this.prisma.payrollReceipt.create({
                    data: {
                        companyId: line.employee.companyId,
                        payrollPeriodId: periodId,
                        employeeId: line.employeeId,
                        grossAmount: Number(line.baseTimbrado || line.baseSalary || 0),
                        deductions: Number(line.totalDeductions || 0),
                        netAmount: Number(line.netTimbrado || line.netPay || 0),
                        breakdown: JSON.stringify({
                            imssEmployee: Number(line.imssEmployee),
                            isrRetention: Number(line.isrRetention),
                            infonavit: Number(line.infonavit),
                            loans: Number(line.loans),
                            overtime: Number(line.overtime),
                            bonus: Number(line.bonus),
                            _split: {
                                baseTimbrado: Number(line.baseTimbrado || 0),
                                baseEfectivo: Number(line.baseEfectivo || 0),
                                netEfectivo: Number(line.netEfectivo || 0),
                            },
                        }),
                        publishedAt: new Date(),
                        generatedById: publishedById,
                        status: 'PUBLICADO',
                    },
                });
                published++;
            }
            catch { }
        }
        return { published };
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map