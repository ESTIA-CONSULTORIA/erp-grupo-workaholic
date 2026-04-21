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
exports.FlowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guards_1 = require("../auth/auth.guards");
const flow_service_1 = require("./flow.service");
let FlowController = class FlowController {
    constructor(svc) {
        this.svc = svc;
    }
    getBalances(id) {
        return this.svc.getBalances(id);
    }
    transfer(id, body) {
        return this.svc.transfer(id, body);
    }
    createMovement(id, body, req) {
        return this.svc.createMovement(id, req.user.sub, body);
    }
    getMovements(id, fecha, period) {
        return this.svc.getMovements(id, fecha, period);
    }
    updateAccount(accountId, body) {
        return this.svc.updateAccount(accountId, body);
    }
};
exports.FlowController = FlowController;
__decorate([
    (0, common_1.Get)('balances'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FlowController.prototype, "getBalances", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FlowController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)('movements'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FlowController.prototype, "createMovement", null);
__decorate([
    (0, common_1.Get)('movements'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('fecha')),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FlowController.prototype, "getMovements", null);
__decorate([
    (0, common_1.Put)('accounts/:accountId'),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FlowController.prototype, "updateAccount", null);
exports.FlowController = FlowController = __decorate([
    (0, swagger_1.ApiTags)('Flow'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('companies/:companyId/flow'),
    __metadata("design:paramtypes", [flow_service_1.FlowService])
], FlowController);
//# sourceMappingURL=flow.controller.js.map