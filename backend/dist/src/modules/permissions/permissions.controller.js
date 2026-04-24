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
const permissions_service_1 = require("./permissions.service");
let PermissionsController = class PermissionsController {
    constructor(svc) {
        this.svc = svc;
    }
    getDefaults() {
        return this.svc.getDefaultPermissions();
    }
    getByRole(role, cid) {
        return this.svc.getPermissions(role, cid);
    }
    getAll(cid) {
        return this.svc.getAllPermissions(cid);
    }
    update(role, mod, action, body) {
        return this.svc.updatePermission(role, mod, action, body.allowed, body.companyId);
    }
    reset(role, body) {
        return this.svc.resetToDefaults(role, body.companyId);
    }
};
exports.PermissionsController = PermissionsController;
__decorate([
    (0, common_1.Get)('defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getDefaults", null);
__decorate([
    (0, common_1.Get)('roles/:roleCode'),
    __param(0, (0, common_1.Param)('roleCode')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getByRole", null);
__decorate([
    (0, common_1.Get)('all'),
    __param(0, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Put)('roles/:roleCode/modules/:module/actions/:action'),
    __param(0, (0, common_1.Param)('roleCode')),
    __param(1, (0, common_1.Param)('module')),
    __param(2, (0, common_1.Param)('action')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('roles/:roleCode/reset'),
    __param(0, (0, common_1.Param)('roleCode')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PermissionsController.prototype, "reset", null);
exports.PermissionsController = PermissionsController = __decorate([
    (0, common_1.Controller)('permissions'),
    __metadata("design:paramtypes", [permissions_service_1.PermissionsService])
], PermissionsController);
//# sourceMappingURL=permissions.controller.js.map