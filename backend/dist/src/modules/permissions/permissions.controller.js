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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../auth/auth.guards");
const permissions_service_1 = require("./permissions.service");
let PermissionsController = class PermissionsController {
    constructor(svc) {
        this.svc = svc;
    }
    getModules(cid, code) {
        return this.svc.getModulesForCompany(code);
    }
    getRoles(cid, code) {
        return this.svc.getRoles(cid, code);
    }
    createRole(cid, body) {
        return this.svc.createRole(cid, body);
    }
    updateRole(cid, rc, body) {
        return this.svc.updateRole(cid, rc, body);
    }
    suspendRole(cid, rc) {
        return this.svc.suspendRole(cid, rc);
    }
    deleteRole(cid, rc) {
        return this.svc.deleteRole(cid, rc);
    }
    copyFrom(cid, to, from) {
        return this.svc.copyPermissions(cid, from, to);
    }
    getAll(cid) {
        return this.svc.getAllForCompany(cid);
    }
    getForRole(cid, rc) {
        return this.svc.getForRole(cid, rc);
    }
    setPermission(cid, role, module, action, body) {
        return this.svc.setPermission(cid, role, module, action, body.allowed);
    }
    reset(cid, rc) {
        return this.svc.resetToDefaults(cid, rc);
    }
    getDefaults() { return this.svc.getDefaults(); }
    getModuleActions() { return this.svc.getModuleActions(); }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('modules'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('companyCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getModules", null);
__decorate([
    (0, common_1.Get)('roles'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('companyCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:roleCode'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('roleCode')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Put)('roles/:roleCode/suspend'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "suspendRole", null);
__decorate([
    (0, common_1.Delete)('roles/:roleCode'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)('roles/:roleCode/copy-from/:fromRole'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('roleCode')),
    __param(2, (0, common_1.Param)('fromRole')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "copyFrom", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('roles/:roleCode'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getForRole", null);
__decorate([
    (0, common_1.Put)('roles/:roleCode/modules/:module/actions/:action'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('roleCode')),
    __param(2, (0, common_1.Param)('module')),
    __param(3, (0, common_1.Param)('action')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "setPermission", null);
__decorate([
    (0, common_1.Post)('roles/:roleCode/reset'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "reset", null);
__decorate([
    (0, common_1.Get)('defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getDefaults", null);
__decorate([
    (0, common_1.Get)('module-actions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getModuleActions", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, common_1.Controller)('companies/:companyId/permissions'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map