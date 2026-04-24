// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const LEGAL_TEMPLATES: Record<string, string> = {
  CARTA_TRABAJO: `
Por medio del presente, {{companyName}} hace constar que {{employeeName}},
con RFC {{rfc}}, labora en esta empresa desde el {{startDate}}
desempeñando el puesto de {{position}} con un salario mensual de {{salary}}.

Se expide la presente a petición del interesado el día {{today}}.
`,

  FINIQUITO: `
En {{city}}, a {{today}}, comparecen {{companyName}} y {{employeeName}}
para celebrar el presente finiquito.

El trabajador declara haber recibido la cantidad de {{amount}}
por concepto de:
- Salarios pendientes
- Vacaciones
- Prima vacacional
- Aguinaldo proporcional

Manifestando no tener adeudo pendiente con la empresa.

Firma de conformidad.
`,

  RENUNCIA: `
Yo, {{employeeName}}, por medio de la presente manifiesto mi voluntad
de dar por terminada la relación laboral con {{companyName}} a partir del {{terminationDate}}.

Declaro que no existe presión alguna para tomar esta decisión.

Atentamente.
`,

  CONVENIO: `
En {{city}}, a {{today}}, {{companyName}} y {{employeeName}} celebran el presente convenio
relacionado con la relación laboral que los unió, conforme a las condiciones siguientes:

{{terms}}

Leído que fue el presente, las partes firman de conformidad.
`,

  ACTA_ADMINISTRATIVA: `
En {{city}}, a {{today}}, se levanta la presente acta administrativa
a {{employeeName}} por los siguientes hechos:

{{facts}}

Se deja constancia para los efectos legales correspondientes.
`,

  LIQUIDACION: `
En {{city}}, a {{today}}, se hace constar el cálculo de liquidación correspondiente a {{employeeName}},
quien desempeñaba el puesto de {{position}} en {{companyName}}.

Monto total calculado: {{amount}}

El detalle de conceptos se integra en el expediente correspondiente.
`,
};

export function renderTemplate(template: string, data: Record<string, any> = {}): string {
  return String(template || '').replace(/{{\s*(.*?)\s*}}/g, (_, key) => {
    const value = data[String(key).trim()];
    return value === null || value === undefined ? '' : String(value);
  });
}

export function generateLegalDocument(type: string, data: Record<string, any> = {}) {
  const template = LEGAL_TEMPLATES[type];

  if (!template) {
    throw new Error(`Template no encontrado: ${type}`);
  }

  return renderTemplate(template, data);
}

@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  private todayMx() {
    return new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  }

  private money(value: any) {
    const n = Number(value || 0);
    return n.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    });
  }

  private async buildTemplateData(companyId: string, body: any) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const employeeId = body.employeeId || body.empId;
    const employee = employeeId
      ? await this.prisma.employee.findUnique({ where: { id: employeeId } }).catch(() => null)
      : null;

    const employeeName = employee
      ? [employee.firstName, employee.lastName, employee.secondLastName].filter(Boolean).join(' ')
      : body.employeeName || '';

    return {
      companyName: company?.name || body.companyName || '',
      city: body.city || 'Mexicali, Baja California',
      employeeName,
      rfc: employee?.rfc || body.rfc || '',
      startDate: employee?.startDate ? new Date(employee.startDate).toLocaleDateString('es-MX') : body.startDate || '',
      position: employee?.position || body.position || '',
      salary: this.money(body.salary ?? employee?.grossSalary ?? employee?.dailySalary ?? 0),
      amount: this.money(body.amount ?? body.finiquitoAmount ?? 0),
      today: body.today || this.todayMx(),
      terminationDate: body.terminationDate || '',
      facts: body.facts || body.notes || '',
      terms: body.terms || body.notes || '',
      ...body,
    };
  }

  async getByEmployee(companyId: string, employeeId: string) {
    return this.prisma.legalDocument.findMany({
      where: { companyId, employeeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generate(companyId: string, userId: string, body: any) {
    const type = body.type || body.docType || 'CARTA_TRABAJO';
    const data = await this.buildTemplateData(companyId, body);
    const content = generateLegalDocument(type, data);

    return this.prisma.legalDocument.create({
      data: {
        companyId,
        employeeId: body.employeeId || body.empId || null,
        type,
        content,
        status: body.status || 'GENERADO',
        fileUrl: body.fileUrl || null,
        requestedById: userId || null,
      },
    });
  }

  async update(id: string, body: any) {
    const existing = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Documento legal no encontrado');

    return this.prisma.legalDocument.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });
  }

  async sign(id: string, userId: string, byEmployee = false) {
    const existing = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Documento legal no encontrado');

    const now = new Date();
    const data: any = {
      status: 'FIRMADO',
      signedAt: now,
      signedById: userId || null,
    };

    if (byEmployee) data.signedByEmployeeAt = now;
    else data.signedByCompanyAt = now;

    return this.prisma.legalDocument.update({
      where: { id },
      data,
    });
  }
}
