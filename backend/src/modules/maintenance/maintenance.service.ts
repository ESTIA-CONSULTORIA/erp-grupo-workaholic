// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async seedUsers() {
    const hash = await bcrypt.hash('Workaholic2026!', 10);
    const results: string[] = [];
    const companies = await this.prisma.company.findMany();
    const byCode = Object.fromEntries(companies.map(c => [c.code, c]));

    const getRole = async (code: string) => {
      let r = await this.prisma.role.findUnique({ where: { code } });
      if (!r) r = await this.prisma.role.create({ data: { code, name: code, description: code } });
      return r;
    };

    const createUser = async (name: string, email: string, roleCode: string, codes: string[]) => {
      const existing = await this.prisma.user.findUnique({ where: { email } });
      if (existing) { results.push('exists: ' + email); return; }
      const role = await getRole(roleCode);
      const user = await this.prisma.user.create({ data: { name, email, password: hash, isActive: true } });
      for (const code of codes) {
        const company = byCode[code];
        if (!company) continue;
        await this.prisma.companyUser.create({ data: { userId: user.id, companyId: company.id, roleId: role.id } }).catch(() => {});
      }
      results.push('created: ' + email);
    };

    await createUser('Cajero Workaholic',   'cajero@workaholic.com',  'cajero',  ['WORKAHOLIC']);
    await createUser('Gerente Workaholic',  'gerente@workaholic.com', 'gerente', ['WORKAHOLIC']);
    await createUser('Cajero Palestra',     'cajero@palestra.com',    'cajero',  ['PALESTRA']);
    await createUser('Gerente Palestra',    'gerente@palestra.com',   'gerente', ['PALESTRA']);
    await createUser('Cajero Lonche',       'cajero@lonche.com',      'cajero',  ['LONCHE']);
    await createUser('Gerente Lonche',      'gerente@lonche.com',     'gerente', ['LONCHE']);

    return { results };
  }

  async fixOCSales(companyId: string) {
    const ocs = await this.prisma.ordenCompra.findMany({
      where: { companyId, status: { not: 'CANCELADA' } },
      include: { lineas: true },
    });
    let created = 0;
    const errors: string[] = [];

    for (const oc of ocs) {
      const existing = await this.prisma.sale.findFirst({
        where: { companyId, clientId: oc.clientId, isCredit: true, total: oc.montoTotal,
          date: { gte: new Date(new Date(oc.fecha).setHours(0,0,0,0)), lte: new Date(new Date(oc.fecha).setHours(23,59,59,999)) } },
      });
      if (existing) continue;
      try {
        await this.prisma.sale.create({
          data: { companyId, clientId: oc.clientId, date: new Date(oc.fecha),
            channel: 'MOSTRADOR', isCredit: true, total: oc.montoTotal, paymentMethod: 'CREDITO_CLIENTE',
            lines: oc.lineas.length > 0 ? { create: oc.lineas.map((l: any) => ({
              productId: l.productId, quantity: l.cantidad, unitPrice: l.precioUnitario, total: l.total })) } : undefined },
        });
        created++;
      } catch (e: any) { errors.push('OC ' + (oc as any).numero + ': ' + e.message); }
    }
    return { total: ocs.length, created, errors };
  }
}
