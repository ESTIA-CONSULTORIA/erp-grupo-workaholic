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
const DEFAULT_PERMISSIONS = {
    admin: {
        pos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        gastos: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        cxc: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        cxp: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        inventario: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        compras: ['ver', 'crear', 'editar', 'eliminar', 'exportar'],
        produccion: ['ver', 'crear', 'editar', 'eliminar'],
        catalogo: ['ver', 'crear', 'editar', 'eliminar'],
        rh: ['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar'],
        reportes: ['ver', 'exportar'],
        admin: ['ver', 'crear', 'editar', 'eliminar'],
        corte: ['ver', 'crear', 'editar', 'aprobar'],
        oc: ['ver', 'crear', 'editar', 'eliminar'],
        membresias: ['ver', 'crear', 'editar', 'eliminar'],
        servicios: ['ver', 'crear', 'editar', 'eliminar'],
        comisiones: ['ver', 'editar', 'aprobar'],
    },
    administrador: {
        pos: ['ver', 'crear'],
        gastos: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        cxc: ['ver', 'crear', 'editar', 'exportar'],
        cxp: ['ver', 'crear', 'editar', 'exportar'],
        inventario: ['ver', 'crear', 'editar', 'exportar'],
        compras: ['ver', 'crear', 'editar', 'exportar'],
        produccion: ['ver', 'crear', 'editar'],
        catalogo: ['ver', 'crear', 'editar'],
        rh: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        reportes: ['ver', 'exportar'],
        admin: ['ver', 'crear', 'editar'],
        corte: ['ver', 'aprobar'],
        oc: ['ver', 'crear', 'editar'],
        membresias: ['ver', 'crear', 'editar'],
        servicios: ['ver', 'crear', 'editar'],
        comisiones: ['ver', 'aprobar'],
    },
    gerente: {
        pos: ['ver', 'crear'],
        gastos: ['ver', 'crear', 'exportar'],
        cxc: ['ver', 'exportar'],
        cxp: ['ver', 'exportar'],
        inventario: ['ver', 'exportar'],
        compras: ['ver', 'crear', 'exportar'],
        produccion: ['ver', 'crear'],
        catalogo: ['ver'],
        rh: ['ver', 'aprobar'],
        reportes: ['ver', 'exportar'],
        corte: ['ver', 'aprobar'],
        oc: ['ver', 'crear'],
        membresias: ['ver', 'crear'],
        servicios: ['ver'],
        comisiones: ['ver', 'aprobar'],
    },
    contador: {
        gastos: ['ver', 'crear', 'editar', 'exportar'],
        cxc: ['ver', 'crear', 'editar', 'exportar'],
        cxp: ['ver', 'crear', 'editar', 'exportar'],
        inventario: ['ver', 'exportar'],
        compras: ['ver', 'crear', 'exportar'],
        reportes: ['ver', 'exportar'],
        corte: ['ver', 'aprobar'],
        oc: ['ver', 'exportar'],
        membresias: ['ver', 'exportar'],
    },
    cajero: {
        pos: ['ver', 'crear'],
        gastos: ['ver', 'crear'],
        corte: ['ver', 'crear'],
        oc: ['ver'],
        membresias: ['ver', 'crear'],
    },
    rh: {
        rh: ['ver', 'crear', 'editar', 'aprobar', 'exportar'],
        reportes: ['ver'],
        comisiones: ['ver', 'aprobar'],
    },
    director: {
        gastos: ['ver', 'exportar'],
        cxc: ['ver', 'exportar'],
        cxp: ['ver', 'exportar'],
        reportes: ['ver', 'exportar'],
        rh: ['ver'],
        membresias: ['ver'],
        comisiones: ['ver'],
    },
};
let PermissionsService = class PermissionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPermissions(roleCode, companyId) {
        const dbPerms = await this.prisma.rolPermiso.findMany({
            where: {
                roleCode,
                OR: [{ companyId: companyId || null }, { companyId: null }],
            },
        });
        if (dbPerms.length > 0) {
            const result = {};
            for (const p of dbPerms) {
                if (!result[p.module])
                    result[p.module] = [];
                if (p.allowed)
                    result[p.module].push(p.action);
            }
            return result;
        }
        return DEFAULT_PERMISSIONS[roleCode] || {};
    }
    async getAllPermissions(companyId) {
        const roles = Object.keys(DEFAULT_PERMISSIONS);
        const result = {};
        for (const role of roles) {
            result[role] = await this.getPermissions(role, companyId);
        }
        return result;
    }
    async can(roleCode, module, action, companyId) {
        const dbPerm = await this.prisma.rolPermiso.findFirst({
            where: { roleCode, module, action,
                OR: [{ companyId: companyId || null }, { companyId: null }] },
        });
        if (dbPerm)
            return dbPerm.allowed;
        const defaults = DEFAULT_PERMISSIONS[roleCode] || {};
        return (defaults[module] || []).includes(action);
    }
    async updatePermission(roleCode, module, action, allowed, companyId) {
        return this.prisma.rolPermiso.upsert({
            where: { roleCode_module_action_companyId: { roleCode, module, action, companyId: companyId || null } },
            update: { allowed },
            create: { roleCode, module, action, allowed, companyId: companyId || null },
        });
    }
    async resetToDefaults(roleCode, companyId) {
        await this.prisma.rolPermiso.deleteMany({
            where: { roleCode, OR: [{ companyId: companyId || null }, { companyId: null }] },
        });
        return { reset: true, role: roleCode };
    }
    getDefaultPermissions() {
        return DEFAULT_PERMISSIONS;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map