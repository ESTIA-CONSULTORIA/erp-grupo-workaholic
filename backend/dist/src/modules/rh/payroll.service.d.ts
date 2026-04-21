import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PayrollService {
    private prisma;
    constructor(prisma: PrismaService);
    getPeriods(companyId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    createPeriod(companyId: string, data: any): import(".prisma/client").Prisma.Prisma__PayrollPeriodClient<{
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
    loadEmployees(periodId: string): Promise<{
        loaded: number;
        total: number;
    }>;
    getLines(periodId: string): import(".prisma/client").Prisma.PrismaPromise<({
        employee: {
            id: string;
            employeeNumber: string;
            firstName: string;
            lastName: string;
            position: string;
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
    updateLine(lineId: string, data: any): Promise<{
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
    exportToContpaq(periodId: string): Promise<{
        csv: string;
        fileName: string;
        recordCount: number;
        totalNet: number;
    }>;
    registerPayment(periodId: string, cashAccountId: string, userId: string): Promise<{
        flowMovementId: string;
        totalNet: number;
        periodLabel: string;
    }>;
}
