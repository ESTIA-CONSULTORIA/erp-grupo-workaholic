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
exports.IntercompanyController = void 0;
const common_1 = require("@nestjs/common");
const intercompany_service_1 = require("./intercompany.service");
let IntercompanyController = class IntercompanyController {
    constructor(svc) {
        this.svc = svc;
    }
    getTransfers(cid, period) {
        return this.svc.getTransfers(cid, period);
    }
    create(cid, req, body) {
        return this.svc.createTransfer(cid, req.user.sub, body);
    }
    approve(id, req, body) {
        return this.svc.approveTransfer(id, req.user.sub, body.approved, body.motivo);
    }
    getPending(cid) {
        return this.svc.getTransfers(cid);
    }
};
exports.IntercompanyController = IntercompanyController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], IntercompanyController.prototype, "getTransfers", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], IntercompanyController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':transferId/approve'),
    __param(0, (0, common_1.Param)('transferId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], IntercompanyController.prototype, "approve", null);
__decorate([
    (0, common_1.Get)('pending/:toCompanyId'),
    __param(0, (0, common_1.Param)('toCompanyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], IntercompanyController.prototype, "getPending", null);
exports.IntercompanyController = IntercompanyController = __decorate([
    (0, common_1.Controller)('companies/:companyId/intercompany'),
    __metadata("design:paramtypes", [intercompany_service_1.IntercompanyService])
], IntercompanyController);
//# sourceMappingURL=intercompany.controller.js.map