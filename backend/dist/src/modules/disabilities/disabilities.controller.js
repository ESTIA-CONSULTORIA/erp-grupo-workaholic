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
exports.DisabilitiesController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../auth/auth.guards");
const disabilities_service_1 = require("./disabilities.service");
let DisabilitiesController = class DisabilitiesController {
    constructor(svc) {
        this.svc = svc;
    }
    get(cid, eid) { return this.svc.getByEmployee(cid, eid); }
    create(cid, body) { return this.svc.create(cid, body); }
    update(id, body) { return this.svc.update(id, body); }
    validate(id, req) { return this.svc.validate(id, req.user.sub); }
};
exports.DisabilitiesController = DisabilitiesController;
__decorate([
    (0, common_1.Get)('employee/:empId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('empId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DisabilitiesController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DisabilitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DisabilitiesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/validate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DisabilitiesController.prototype, "validate", null);
exports.DisabilitiesController = DisabilitiesController = __decorate([
    (0, common_1.Controller)('companies/:companyId/disabilities'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [disabilities_service_1.DisabilitiesService])
], DisabilitiesController);
//# sourceMappingURL=disabilities.controller.js.map