import { PrismaService } from '../../common/prisma/prisma.service';
export declare class PayrollService {
    private prisma;
    constructor(prisma: PrismaService);
    getPeriods(companyId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: string;
        type: string;
        period: string;
        periodEnd: string;
        periodLabel: string;
        status: string;
        totalGross: import("@prisma/client/runtime/library").Decimal | null;
        totalNet: import("@prisma/client/runtime/library").Decimal | null;
        totalIMSS: import("@prisma/client/runtime/library").Decimal | null;
        totalISR: import("@prisma/client/runtime/library").Decimal | null;
        exportedAt: Date | null;
        paidAt: Date | null;
        paidById: string | null;
        flowMovementId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createPeriod(companyId: string, data: any): import(".prisma/client").Prisma.Prisma__PayrollPeriodClient<{
        id: string;
        companyId: string;
        type: string;
        period: string;
        periodEnd: string;
        periodLabel: string;
        status: string;
        totalGross: import("@prisma/client/runtime/library").Decimal | null;
        totalNet: import("@prisma/client/runtime/library").Decimal | null;
        totalIMSS: import("@prisma/client/runtime/library").Decimal | null;
        totalISR: import("@prisma/client/runtime/library").Decimal | null;
        exportedAt: Date | null;
        paidAt: Date | null;
        paidById: string | null;
        flowMovementId: string | null;
        createdAt: Date;
        updatedAt: Date;
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
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        payrollPeriodId: string;
        employeeId: string;
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
        notes: string | null;
    })[]>;
    updateLine(lineId: string, data: any): Promise<{
        id: string;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
        payrollPeriodId: string;
        employeeId: string;
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
        notes: string | null;
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
    calculatePeriod(periodId: string): Promise<{
        calculated: number;
    }>;
    closePeriod(periodId: string): Promise<{
        id: string;
        companyId: string;
        type: string;
        period: string;
        periodEnd: string;
        periodLabel: string;
        status: string;
        totalGross: import("@prisma/client/runtime/library").Decimal | null;
        totalNet: import("@prisma/client/runtime/library").Decimal | null;
        totalIMSS: import("@prisma/client/runtime/library").Decimal | null;
        totalISR: import("@prisma/client/runtime/library").Decimal | null;
        exportedAt: Date | null;
        paidAt: Date | null;
        paidById: string | null;
        flowMovementId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    publishReceipts(periodId: string, publishedById: string): Promise<{
        published: number;
    }>;
}
