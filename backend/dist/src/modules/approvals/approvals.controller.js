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
exports.ApprovalsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../auth/auth.guards");
const approvals_service_1 = require("./approvals.service");
let ApprovalsController = class ApprovalsController {
    constructor(svc) {
        this.svc = svc;
    }
    create(cid, req, body) {
        const role = req.user?.roleCode || 'empleado';
        return this.svc.create(cid, req.user.sub, role, body);
    }
    getAll(cid, q) {
        return this.svc.getByCompany(cid, q);
    }
    getPending(cid, req, role) {
        return this.svc.getPendingForUser(cid, req.user.sub, role || 'cajero');
    }
    getOne(id) { return this.svc.findOne(id); }
    act(id, sid, req, body) {
        return this.svc.act(id, sid, req.user.sub, body.approved, body.comment);
    }
    cancel(id, req, body) {
        return this.svc.cancel(id, req.user.sub, body.reason || '');
    }
};
exports.ApprovalsController = ApprovalsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getPending", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Put)(':id/steps/:stepId/act'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('stepId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "act", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ApprovalsController.prototype, "cancel", null);
exports.ApprovalsController = ApprovalsController = __decorate([
    (0, common_1.Controller)('companies/:companyId/approvals'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [approvals_service_1.ApprovalsService])
], ApprovalsController);
//# sourceMappingURL=approvals.controller.js.map