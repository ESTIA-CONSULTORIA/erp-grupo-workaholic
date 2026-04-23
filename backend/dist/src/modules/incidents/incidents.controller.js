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
exports.IncidentsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../auth/auth.guards");
const incidents_service_1 = require("./incidents.service");
let IncidentsController = class IncidentsController {
    constructor(svc) {
        this.svc = svc;
    }
    getByEmp(cid, eid) { return this.svc.getByEmployee(cid, eid); }
    getByPeriod(cid, pid) { return this.svc.getByPeriod(cid, pid); }
    create(cid, req, body) { return this.svc.create(cid, req.user.sub, body); }
    update(id, body) { return this.svc.update(id, body); }
    approve(id, req, body) { return this.svc.approve(id, req.user.sub, body.hrId || req.user.sub); }
};
exports.IncidentsController = IncidentsController;
__decorate([
    (0, common_1.Get)('employee/:empId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('empId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "getByEmp", null);
__decorate([
    (0, common_1.Get)('period/:periodId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "getByPeriod", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], IncidentsController.prototype, "approve", null);
exports.IncidentsController = IncidentsController = __decorate([
    (0, common_1.Controller)('companies/:companyId/incidents'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [incidents_service_1.IncidentsService])
], IncidentsController);
//# sourceMappingURL=incidents.controller.js.map