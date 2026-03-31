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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guards_1 = require("../auth/auth.guards");
const payroll_service_1 = require("./payroll.service");
let PayrollController = class PayrollController {
    constructor(svc) {
        this.svc = svc;
    }
    getPeriods(cid) { return this.svc.getPeriods(cid); }
    createPeriod(cid, body) { return this.svc.createPeriod(cid, body); }
    loadEmployees(id) { return this.svc.loadEmployees(id); }
    getLines(id) { return this.svc.getLines(id); }
    updateLine(id, body) { return this.svc.updateLine(id, body); }
    async exportContpaq(id, res) {
        const result = await this.svc.exportToContpaq(id);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);
        res.send('\uFEFF' + result.csv);
    }
    registerPayment(id, req, body) {
        return this.svc.registerPayment(id, body.cashAccountId, req.user.sub);
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Get)('periods'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getPeriods", null);
__decorate([
    (0, common_1.Post)('periods'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "createPeriod", null);
__decorate([
    (0, common_1.Post)('periods/:periodId/load'),
    __param(0, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "loadEmployees", null);
__decorate([
    (0, common_1.Get)('periods/:periodId/lines'),
    __param(0, (0, common_1.Param)('periodId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "getLines", null);
__decorate([
    (0, common_1.Put)('lines/:lineId'),
    __param(0, (0, common_1.Param)('lineId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "updateLine", null);
__decorate([
    (0, common_1.Post)('periods/:periodId/export'),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "exportContpaq", null);
__decorate([
    (0, common_1.Post)('periods/:periodId/pay'),
    __param(0, (0, common_1.Param)('periodId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PayrollController.prototype, "registerPayment", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('companies/:companyId/payroll'),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map