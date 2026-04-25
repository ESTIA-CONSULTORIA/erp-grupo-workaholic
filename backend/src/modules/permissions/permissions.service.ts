// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const DEFAULT_PERMISSIONS: Record<string, Record<string, string[]>> = {
  admin: {
    pos: ['ver','crear','editar','eliminar','exportar'],
    gastos: ['ver','crear','editar','eliminar','aprobar','exportar'],
    cxc: ['ver','crear','editar','eliminar','exportar'],
    cxp: ['ver','crear','editar','eliminar','exportar'],
    inventario: ['ver','crear','editar','eliminar','exportar'],
    compras: ['ver','crear','editar','eliminar','exportar'],
    produccion: ['ver','crear','editar','eliminar'],
    catalogo: ['ver','crear','editar','eliminar'],
    rh: ['ver','crear','editar','eliminar','aprobar','exportar'],
    reportes: ['ver','exportar'],
    admin: ['ver','crear','editar','eliminar'],
    corte: ['ver','crear','editar','aprobar'],
    oc: ['ver','crear','editar','eliminar'],
    membresias: ['ver','crear','editar','eliminar'],
    servicios: ['ver','crear','editar','eliminar'],
    comisiones: ['ver','editar','aprobar'],
    documentos: ['ver','crear','editar','eliminar'],
    legal: ['ver','crear','editar','aprobar','exportar'],
    intercompany: ['ver','crear','aprobar'],
    permisos: ['ver','editar'],
  },
  administrador: {
    pos: ['ver','crear'], gastos: ['ver','crear','editar','aprobar','exportar'],
    cxc: ['ver','crear','editar','exportar'], cxp: ['ver','crear','editar','exportar'],
    inventario: ['ver','crear','editar','exportar'], compras: ['ver','crear','editar','exportar'],
    produccion: ['ver','crear','editar'], catalogo: ['ver','crear','editar'],
    rh: ['ver','crear','editar','aprobar','exportar'], reportes: ['ver','exportar'],
    admin: ['ver','crear','editar'], corte: ['ver','aprobar'], oc: ['ver','crear','editar'],
    membresias: ['ver','crear','editar'], servicios: ['ver','crear','editar'], comisiones: ['ver','aprobar'],
    documentos: ['ver','crear'], legal: ['ver','crear'], intercompany: ['ver','crear'], permisos: ['ver'],
  },
  gerente: {
    pos: ['ver','crear'], gastos: ['ver','crear','exportar'], cxc: ['ver','exportar'], cxp: ['ver','exportar'],
    inventario: ['ver','exportar'], compras: ['ver','crear','exportar'], produccion: ['ver','crear'], catalogo: ['ver'],
    rh: ['ver','aprobar'], reportes: ['ver','exportar'], corte: ['ver','aprobar'], oc: ['ver','crear'],
    membresias: ['ver','crear'], servicios: ['ver'], comisiones: ['ver','aprobar'], intercompany: ['ver'],
  },
  contador: {
    gastos: ['ver','crear','editar','exportar'], cxc: ['ver','crear','editar','exportar'], cxp: ['ver','crear','editar','exportar'],
    inventario: ['ver','exportar'], compras: ['ver','crear','exportar'], reportes: ['ver','exportar'],
    corte: ['ver','aprobar'], oc: ['ver','exportar'], membresias: ['ver','exportar'], intercompany: ['ver','crear'],
  },
  cajero: { pos: ['ver','crear'], gastos: ['ver','crear'], corte: ['ver','crear'], oc: ['ver'], membresias: ['ver','crear'] },
  rh: { rh: ['ver','crear','editar','aprobar','exportar'], reportes: ['ver'], comisiones: ['ver','aprobar'], documentos: ['ver','crear'], legal: ['ver','crear'] },
  director: { gastos: ['ver','exportar'], cxc: ['ver','exportar'], cxp: ['ver','exportar'], reportes: ['ver','exportar'], rh: ['ver'], membresias: ['ver'], comisiones: ['ver'], intercompany: ['ver','aprobar'], legal: ['ver','aprobar'] },
};

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  private normalizeCompanyId(companyId?: string | null) {
    return companyId && companyId !== 'null' && companyId !== 'undefined' ? companyId : null;
  }

  private delegate() {
    return this.prisma.roleModulePermission;
  }

  async getPermissions(roleCode: string, companyId?: string) {
    const cid = this.normalizeCompanyId(companyId);
    const dbPerms = await this.delegate().findMany({
      where: { roleCode, OR: [{ companyId: cid }, { companyId: null }] },
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    if (dbPerms.length > 0) {
      const result: Record<string, string[]> = {};
      for (const p of dbPerms) {
        if (!result[p.module]) result[p.module] = [];
        if (p.allowed && !result[p.module].includes(p.action)) result[p.module].push(p.action);
      }
      return result;
    }

    return DEFAULT_PERMISSIONS[roleCode] || {};
  }

  async getAllPermissions(companyId?: string) {
    const roles = Object.keys(DEFAULT_PERMISSIONS);
    const result: Record<string, any> = {};
    for (const role of roles) result[role] = await this.getPermissions(role, companyId);
    return result;
  }

  async can(roleCode: string, module: string, action: string, companyId?: string): Promise<boolean> {
    const cid = this.normalizeCompanyId(companyId);
    const dbPerm = await this.delegate().findFirst({
      where: { roleCode, module, action, OR: [{ companyId: cid }, { companyId: null }] },
      orderBy: [{ companyId: 'desc' }],
    });
    if (dbPerm) return !!dbPerm.allowed;
    return ((DEFAULT_PERMISSIONS[roleCode] || {})[module] || []).includes(action);
  }

  async updatePermission(roleCode: string, module: string, action: string, allowed: boolean, companyId?: string) {
    const cid = this.normalizeCompanyId(companyId);
    return this.delegate().upsert({
      where: { roleCode_module_action_companyId: { roleCode, module, action, companyId: cid } },
      update: { allowed },
      create: { roleCode, module, action, allowed, companyId: cid },
    });
  }

  async resetToDefaults(roleCode: string, companyId?: string) {
    const cid = this.normalizeCompanyId(companyId);
    await this.delegate().deleteMany({ where: { roleCode, companyId: cid } });
    return { reset: true, role: roleCode, companyId: cid };
  }

  getDefaultPermissions() { return DEFAULT_PERMISSIONS; }
}
