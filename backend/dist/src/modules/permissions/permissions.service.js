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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const COMPANY_MODULES = {
    MACHETE: ['pos', 'catalogo', 'inventario', 'compras', 'produccion', 'oc', 'corte', 'gastos', 'cxc', 'cxp', 'reportes', 'rh', 'nomina', 'documentos', 'admin'],
    PALESTRA: ['pos', 'membresias', 'servicios', 'comisiones', 'inventario', 'corte', 'gastos', 'cxc', 'cxp', 'reportes', 'rh', 'nomina', 'documentos', 'admin'],
    WORKAHOLIC: ['pos', 'membresias', 'espacios', 'reservaciones', 'corte', 'gastos', 'cxc', 'cxp', 'reportes', 'rh', 'nomina', 'documentos', 'admin'],
    LONCHE: ['pos', 'catalogo', 'surtido', 'alumnos', 'corte', 'gastos', 'cxc', 'cxp', 'reportes', 'rh', 'nomina', 'documentos', 'admin'],
};
const MODULE_ACTIONS = {
    pos: ['ver', 'crear'],
    catalogo: ['ver', 'crear', 'editar', 'eliminar'],
    inventario: ['ver', 'editar', 'exportar'],
    compras: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
    produccion: ['ver', 'crear', 'editar', 'eliminar'],
    oc: ['ver', 'crear', 'editar', 'eliminar'],
    corte: ['ver', 'crear', 'aprobar'],
    gastos: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
    cxc: ['ver', 'crear', 'editar', 'exportar'],
    cxp: ['ver', 'crear', 'editar', 'exportar'],
    reportes: ['ver', 'exportar'],
    rh: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
    nomina: ['ver', 'editar', 'aprobar', 'exportar'],
    documentos: ['ver', 'crear'],
    admin: ['ver', 'crear', 'editar', 'eliminar'],
    membresias: ['ver', 'crear', 'editar', 'eliminar'],
    servicios: ['ver', 'crear', 'editar', 'eliminar'],
    comisiones: ['ver', 'aprobar'],
    espacios: ['ver', 'crear', 'editar'],
    reservaciones: ['ver', 'crear', 'editar', 'eliminar'],
    surtido: ['ver', 'crear'],
    alumnos: ['ver', 'crear', 'editar'],
};
const DEFAULTS = {
    gerente: { pos: ['ver', 'crear'], catalogo: ['ver'], inventario: ['ver', 'exportar'], compras: ['ver', 'crear', 'exportar'], produccion: ['ver', 'crear'], oc: ['ver', 'crear'], corte: ['ver', 'aprobar'], gastos: ['ver', 'crear', 'exportar'], cxc: ['ver', 'exportar'], cxp: ['ver', 'exportar'], reportes: ['ver', 'exportar'], rh: ['ver', 'aprobar'], nomina: ['ver'], documentos: ['ver'], membresias: ['ver', 'crear'], servicios: ['ver'], comisiones: ['ver', 'aprobar'], espacios: ['ver', 'crear'], reservaciones: ['ver', 'crear', 'editar'], surtido: ['ver', 'crear'], alumnos: ['ver'] },
    contador: { gastos: ['ver', 'crear', 'editar', 'exportar'], cxc: ['ver', 'crear', 'editar', 'exportar'], cxp: ['ver', 'crear', 'editar', 'exportar'], inventario: ['ver', 'exportar'], compras: ['ver', 'exportar'], reportes: ['ver', 'exportar'], corte: ['ver', 'aprobar'], oc: ['ver', 'exportar'], documentos: ['ver'], rh: ['ver', 'exportar'], nomina: ['ver', 'editar', 'aprobar', 'exportar'] },
    cajero: { pos: ['ver', 'crear'], corte: ['ver', 'crear'], oc: ['ver'] },
    rh: { rh: ['ver', 'crear', 'editar', 'aprobar', 'exportar'], nomina: ['ver', 'editar', 'aprobar', 'exportar'], documentos: ['ver', 'crear'] },
    director: { reportes: ['ver', 'exportar'], gastos: ['ver', 'exportar'], cxc: ['ver', 'exportar'], cxp: ['ver', 'exportar'], rh: ['ver'], nomina: ['ver'], membresias: ['ver'], comisiones: ['ver'] },
    produccion_op: { produccion: ['ver', 'crear', 'editar'], inventario: ['ver'] },
    coach: { pos: ['ver', 'crear'], comisiones: ['ver'] },
    encargado_alm: { surtido: ['ver', 'crear'], catalogo: ['ver', 'crear', 'editar'], inventario: ['ver', 'editar'] },
};
const BASE_ROLES = {
    MACHETE: [{ code: 'gerente', label: 'Gerente', color: '#3b82f6' }, { code: 'contador', label: 'Contador', color: '#8b5cf6' }, { code: 'cajero', label: 'Cajero', color: '#10b981' }, { code: 'produccion_op', label: 'Op. Producción', color: '#f59e0b' }, { code: 'rh', label: 'RH', color: '#06b6d4' }, { code: 'director', label: 'Director', color: '#64748b' }],
    PALESTRA: [{ code: 'gerente', label: 'Gerente', color: '#3b82f6' }, { code: 'contador', label: 'Contador', color: '#8b5cf6' }, { code: 'cajero', label: 'Cajero', color: '#10b981' }, { code: 'coach', label: 'Coach', color: '#f59e0b' }, { code: 'rh', label: 'RH', color: '#06b6d4' }, { code: 'director', label: 'Director', color: '#64748b' }],
    WORKAHOLIC: [{ code: 'gerente', label: 'Gerente', color: '#3b82f6' }, { code: 'contador', label: 'Contador', color: '#8b5cf6' }, { code: 'cajero', label: 'Cajero', color: '#10b981' }, { code: 'rh', label: 'RH', color: '#06b6d4' }, { code: 'director', label: 'Director', color: '#64748b' }],
    LONCHE: [{ code: 'gerente', label: 'Gerente', color: '#3b82f6' }, { code: 'contador', label: 'Contador', color: '#8b5cf6' }, { code: 'cajero', label: 'Cajero', color: '#10b981' }, { code: 'encargado_alm', label: 'Enc. Almacén', color: '#f59e0b' }, { code: 'rh', label: 'RH', color: '#06b6d4' }],
};
let PermissionsService = class PermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getModulesForCompany(companyCode) {
        const code = (companyCode || '').toUpperCase();
        return (COMPANY_MODULES[code] || Object.keys(MODULE_ACTIONS)).map(mod => ({
            key: mod, actions: MODULE_ACTIONS[mod] || [],
        }));
    }
    async getRoles(companyId, companyCode) {
        const code = (companyCode || await this._getCompanyCode(companyId)).toUpperCase();
        const base = (BASE_ROLES[code] || BASE_ROLES['MACHETE']).map(r => ({ ...r, isBase: true, isActive: true, companyId }));
        let custom = [];
        try {
            custom = await this.prisma.companyRole.findMany({
                where: { companyId, isActive: true },
                orderBy: { label: 'asc' },
            });
            custom = custom.map(r => ({ ...r, isBase: false }));
        }
        catch { }
        const baseCodes = new Set(base.map(r => r.code));
        return [...base, ...custom.filter(r => !baseCodes.has(r.code))];
    }
    async createRole(companyId, data) {
        const code = data.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const role = await this.prisma.companyRole.create({
            data: { companyId, code, label: data.label, color: data.color || '#64748b', description: data.description || null },
        });
        if (data.copyFrom)
            await this.copyPermissions(companyId, data.copyFrom, code);
        return role;
    }
    async updateRole(companyId, roleCode, data) {
        const isBase = Object.values(BASE_ROLES).flat().some(r => r.code === roleCode);
        if (isBase)
            throw new Error('Los roles base no se pueden editar. Crea un rol personalizado basado en él.');
        return this.prisma.companyRole.updateMany({
            where: { companyId, code: roleCode },
            data: { label: data.label, color: data.color, description: data.description },
        });
    }
    async suspendRole(companyId, roleCode) {
        const isBase = Object.values(BASE_ROLES).flat().some(r => r.code === roleCode);
        if (isBase)
            throw new Error('Los roles base no se pueden suspender');
        return this.prisma.companyRole.updateMany({ where: { companyId, code: roleCode }, data: { isActive: false } });
    }
    async deleteRole(companyId, roleCode) {
        const isBase = Object.values(BASE_ROLES).flat().some(r => r.code === roleCode);
        if (isBase)
            throw new Error('Los roles base no se pueden eliminar');
        await this.prisma.rolPermiso.deleteMany({ where: { companyId, roleCode } });
        return this.prisma.companyRole.deleteMany({ where: { companyId, code: roleCode } });
    }
    async getForRole(companyId, roleCode) {
        const dbPerms = await this.prisma.rolPermiso.findMany({
            where: { companyId, roleCode },
        });
        if (dbPerms.length === 0) {
            return DEFAULTS[roleCode] || {};
        }
        const result = {};
        for (const p of dbPerms) {
            if (!result[p.module])
                result[p.module] = [];
            if (p.allowed && !result[p.module].includes(p.action))
                result[p.module].push(p.action);
        }
        return result;
    }
    async getAllForCompany(companyId) {
        const roles = await this.getRoles(companyId);
        const result = {};
        await Promise.all(roles.map(async (role) => {
            result[role.code] = await this.getForRole(companyId, role.code);
        }));
        return result;
    }
    async setPermission(companyId, roleCode, module, action, allowed) {
        const existing = await this.prisma.rolPermiso.findFirst({ where: { companyId, roleCode, module, action } });
        if (existing) {
            return this.prisma.rolPermiso.update({ where: { id: existing.id }, data: { allowed } });
        }
        return this.prisma.rolPermiso.create({ data: { companyId, roleCode, module, action, allowed } });
    }
    async resetToDefaults(companyId, roleCode) {
        await this.prisma.rolPermiso.deleteMany({ where: { companyId, roleCode } });
        return { reset: true, defaults: DEFAULTS[roleCode] || {} };
    }
    async copyPermissions(companyId, fromRole, toRole) {
        const source = await this.getForRole(companyId, fromRole);
        await this.prisma.rolPermiso.deleteMany({ where: { companyId, roleCode: toRole } });
        const data = [];
        for (const [module, actions] of Object.entries(source)) {
            for (const action of actions) {
                data.push({ companyId, roleCode: toRole, module, action, allowed: true });
            }
        }
        if (data.length)
            await this.prisma.rolPermiso.createMany({ data, skipDuplicates: true });
        return source;
    }
    async can(companyId, roleCode, module, action) {
        if (roleCode === 'admin' || roleCode === 'administrador')
            return true;
        const perms = await this.getForRole(companyId, roleCode);
        return (perms[module] || []).includes(action);
    }
    getModuleActions() { return MODULE_ACTIONS; }
    getDefaults() { return DEFAULTS; }
    async _getCompanyCode(companyId) {
        try {
            const c = await this.prisma.company.findUnique({ where: { id: companyId }, select: { code: true } });
            return (c?.code || 'MACHETE').toUpperCase();
        }
        catch {
            return 'MACHETE';
        }
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map