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
exports.PermissionGuard = exports.PERMISSION_KEY = void 0;
exports.RequirePermission = RequirePermission;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const permissions_service_1 = require("./permissions.service");
exports.PERMISSION_KEY = 'permission';
function RequirePermission(module, action) {
    return (target, key, descriptor) => {
        if (descriptor) {
            Reflect.defineMetadata(exports.PERMISSION_KEY, { module, action }, descriptor.value);
            return descriptor;
        }
        Reflect.defineMetadata(exports.PERMISSION_KEY, { module, action }, target);
        return target;
    };
}
let PermissionGuard = class PermissionGuard {
    constructor(reflector, permissionsService) {
        this.reflector = reflector;
        this.permissionsService = permissionsService;
    }
    async canActivate(ctx) {
        const permission = this.reflector.get(exports.PERMISSION_KEY, ctx.getHandler());
        if (!permission)
            return true;
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;
        if (!user)
            throw new common_1.ForbiddenException('No autenticado');
        const roleCode = user.roleCode || user.role || 'cajero';
        const companyId = req.params?.companyId || null;
        if (roleCode === 'admin' || roleCode === 'administrador')
            return true;
        const allowed = await this.permissionsService.can(roleCode, permission.module, permission.action, companyId);
        if (!allowed) {
            throw new common_1.ForbiddenException(`No tienes permiso para ${permission.action} en ${permission.module}`);
        }
        return true;
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permissions_service_1.PermissionsService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map