import { PrismaService } from '../../common/prisma/prisma.service';
export declare function renderTemplate(template: string, data?: Record<string, any>): string;
export declare function generateLegalDocument(type: string, data?: Record<string, any>): string;
export declare class LegalService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private todayMx;
    private money;
    private buildTemplateData;
    getByEmployee(companyId: string, employeeId: string): Promise<any>;
    generate(companyId: string, userId: string, body: any): Promise<any>;
    update(id: string, body: any): Promise<any>;
    sign(id: string, userId: string, byEmployee?: boolean): Promise<any>;
}
