import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

// Permisos por defecto para cada rol
const DEFAULT_PERMISSIONS: Record<string, Record<string, string[]>> = {
  admin: {
    pos:        ['ver','crear','editar','eliminar','exportar'],
    gastos:     ['ver','crear','editar','eliminar','aprobar','exportar'],
    cxc:        ['ver','crear','editar','eliminar','exportar'],
    cxp:        ['ver','crear','editar','eliminar','exportar'],
    inventario: ['ver','crear','editar','eliminar','exportar'],
    compras:    ['ver','crear','editar','eliminar','exportar'],
    produccion: ['ver','crear','editar','eliminar'],
    catalogo:   ['ver','crear','editar','eliminar'],
    rh:         ['ver','crear','editar','eliminar','aprobar','exportar'],
    reportes:   ['ver','exportar'],
    admin:      ['ver','crear','editar','eliminar'],
    corte:      ['ver','crear','editar','aprobar'],
    oc:         ['ver','crear','editar','eliminar'],
    membresias: ['ver','crear','editar','eliminar'],
    servicios:  ['ver','crear','editar','eliminar'],
    comisiones: ['ver','editar','aprobar'],
  },
  administrador: {
    pos:        ['ver','crear'],
    gastos:     ['ver','crear','editar','aprobar','exportar'],
    cxc:        ['ver','crear','editar','exportar'],
    cxp:        ['ver','crear','editar','exportar'],
    inventario: ['ver','crear','editar','exportar'],
    compras:    ['ver','crear','editar','exportar'],
    produccion: ['ver','crear','editar'],
    catalogo:   ['ver','crear','editar'],
    rh:         ['ver','crear','editar','aprobar','exportar'],
    reportes:   ['ver','exportar'],
    admin:      ['ver','crear','editar'],
    corte:      ['ver','aprobar'],
    oc:         ['ver','crear','editar'],
    membresias: ['ver','crear','editar'],
    servicios:  ['ver','crear','editar'],
    comisiones: ['ver','aprobar'],
  },
  gerente: {
    pos:        ['ver','crear'],
    gastos:     ['ver','crear','exportar'],
    cxc:        ['ver','exportar'],
    cxp:        ['ver','exportar'],
    inventario: ['ver','exportar'],
    compras:    ['ver','crear','exportar'],
    produccion: ['ver','crear'],
    catalogo:   ['ver'],
    rh:         ['ver','aprobar'],
    reportes:   ['ver','exportar'],
    corte:      ['ver','aprobar'],
    oc:         ['ver','crear'],
    membresias: ['ver','crear'],
    servicios:  ['ver'],
    comisiones: ['ver','aprobar'],
  },
  contador: {
    gastos:     ['ver','crear','editar','exportar'],
    cxc:        ['ver','crear','editar','exportar'],
    cxp:        ['ver','crear','editar','exportar'],
    inventario: ['ver','exportar'],
    compras:    ['ver','crear','exportar'],
    reportes:   ['ver','exportar'],
    corte:      ['ver','aprobar'],
    oc:         ['ver','exportar'],
    membresias: ['ver','exportar'],
  },
  cajero: {
    pos:        ['ver','crear'],
    gastos:     ['ver','crear'],
    corte:      ['ver','crear'],
    oc:         ['ver'],
    membresias: ['ver','crear'],
  },
  rh: {
    rh:         ['ver','crear','editar','aprobar','exportar'],
    reportes:   ['ver'],
    comisiones: ['ver','aprobar'],
  },
  director: {
    gastos:     ['ver','exportar'],
    cxc:        ['ver','exportar'],
    cxp:        ['ver','exportar'],
    reportes:   ['ver','exportar'],
    rh:         ['ver'],
    membresias: ['ver'],
    comisiones: ['ver'],
  },
};

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // Obtener permisos de un rol (DB primero, luego defaults)
  async getPermissions(roleCode: string, companyId?: string) {
    const dbPerms = await this.prisma.permission.findMany({
      where: {
        roleCode,
        OR: [{ companyId: companyId || null }, { companyId: null }],
      },
    });

    // Si hay permisos en DB los usamos, si no los defaults
    if (dbPerms.length > 0) {
      const result: Record<string, string[]> = {};
      for (const p of dbPerms) {
        if (!result[p.module]) result[p.module] = [];
        if (p.allowed) result[p.module].push(p.action);
      }
      return result;
    }

    return DEFAULT_PERMISSIONS[roleCode] || {};
  }

  // Obtener todos los permisos de todos los roles
  async getAllPermissions(companyId?: string) {
    const roles = Object.keys(DEFAULT_PERMISSIONS);
    const result: Record<string, any> = {};
    for (const role of roles) {
      result[role] = await this.getPermissions(role, companyId);
    }
    return result;
  }

  // Verificar si un rol puede hacer una acción en un módulo
  async can(roleCode: string, module: string, action: string, companyId?: string): Promise<boolean> {
    const dbPerm = await this.prisma.permission.findFirst({
      where: { roleCode, module, action,
        OR: [{ companyId: companyId || null }, { companyId: null }] },
    });

    if (dbPerm) return dbPerm.allowed;

    // Fallback a defaults
    const defaults = DEFAULT_PERMISSIONS[roleCode] || {};
    return (defaults[module] || []).includes(action);
  }

  // Actualizar permisos (upsert)
  async updatePermission(roleCode: string, module: string, action: string, allowed: boolean, companyId?: string) {
    return this.prisma.permission.upsert({
      where: { roleCode_module_action_companyId: { roleCode, module, action, companyId: companyId || null } },
      update: { allowed },
      create: { roleCode, module, action, allowed, companyId: companyId || null },
    });
  }

  // Resetear a defaults
  async resetToDefaults(roleCode: string, companyId?: string) {
    await this.prisma.permission.deleteMany({
      where: { roleCode, OR: [{ companyId: companyId || null }, { companyId: null }] },
    });
    return { reset: true, role: roleCode };
  }

  getDefaultPermissions() {
    return DEFAULT_PERMISSIONS;
  }
}
