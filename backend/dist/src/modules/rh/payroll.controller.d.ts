import { Response } from 'express';
import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private svc;
    constructor(svc: PayrollService);
    getPeriods(cid: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        type: string;
        status: string;
        period: string;
        periodEnd: string;
        periodLabel: string;
        totalGross: import("@prisma/client/runtime/library").Decimal | null;
        totalNet: import("@prisma/client/runtime/library").Decimal | null;
        totalIMSS: import("@prisma/client/runtime/library").Decimal | null;
        totalISR: import("@prisma/client/runtime/library").Decimal | null;
        exportedAt: Date | null;
        paidAt: Date | null;
        paidById: string | null;
        flowMovementId: string | null;
    }[]>;
    createPeriod(cid: string, body: any): import(".prisma/client").Prisma.Prisma__PayrollPeriodClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        type: string;
        status: string;
        period: string;
        periodEnd: string;
        periodLabel: string;
        totalGross: import("@prisma/client/runtime/library").Decimal | null;
        totalNet: import("@prisma/client/runtime/library").Decimal | null;
        totalIMSS: import("@prisma/client/runtime/library").Decimal | null;
        totalISR: import("@prisma/client/runtime/library").Decimal | null;
        exportedAt: Date | null;
        paidAt: Date | null;
        paidById: string | null;
        flowMovementId: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    loadEmployees(id: string): Promise<{
        loaded: number;
        total: number;
    }>;
    getLines(id: string): import(".prisma/client").Prisma.PrismaPromise<({
        employee: {
            id: string;
            position: string;
            lastName: string;
            firstName: string;
            employeeNumber: string;
            bankAccount: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        notes: string | null;
        employeeId: string;
        payrollPeriodId: string;
        baseSalary: import("@prisma/client/runtime/library").Decimal;
        overtime: import("@prisma/client/runtime/library").Decimal;
        bonus: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
        vacationPremium: import("@prisma/client/runtime/library").Decimal;
        otherPerceptions: import("@prisma/client/runtime/library").Decimal;
        totalPerceptions: import("@prisma/client/runtime/library").Decimal;
        imssEmployee: import("@prisma/client/runtime/library").Decimal;
        isrRetention: import("@prisma/client/runtime/library").Decimal;
        infonavit: import("@prisma/client/runtime/library").Decimal;
        loans: import("@prisma/client/runtime/library").Decimal;
        otherDeductions: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        imssEmployer: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    updateLine(id: string, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        companyId: string;
        notes: string | null;
        employeeId: string;
        payrollPeriodId: string;
        baseSalary: import("@prisma/client/runtime/library").Decimal;
        overtime: import("@prisma/client/runtime/library").Decimal;
        bonus: import("@prisma/client/runtime/library").Decimal;
        commission: import("@prisma/client/runtime/library").Decimal;
        vacationPremium: import("@prisma/client/runtime/library").Decimal;
        otherPerceptions: import("@prisma/client/runtime/library").Decimal;
        totalPerceptions: import("@prisma/client/runtime/library").Decimal;
        imssEmployee: import("@prisma/client/runtime/library").Decimal;
        isrRetention: import("@prisma/client/runtime/library").Decimal;
        infonavit: import("@prisma/client/runtime/library").Decimal;
        loans: import("@prisma/client/runtime/library").Decimal;
        otherDeductions: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        imssEmployer: import("@prisma/client/runtime/library").Decimal;
    }>;
    exportContpaq(id: string, res: Response): Promise<void>;
    registerPayment(id: string, req: any, body: {
        cashAccountId: string;
    }): Promise<{
        flowMovementId: string;
        totalNet: number;
        periodLabel: string;
    }>;
}
