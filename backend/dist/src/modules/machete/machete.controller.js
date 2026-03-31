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
exports.MacheteController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guards_1 = require("../auth/auth.guards");
const machete_service_1 = require("./machete.service");
let MacheteController = class MacheteController {
    constructor(svc) {
        this.svc = svc;
    }
    getProducts(cid) { return this.svc.getProducts(cid); }
    getPT(cid) { return this.svc.getPTInventory(cid); }
    getRecipes(cid) { return this.svc.getRecipes(cid); }
    getSales(cid, period, channel) { return this.svc.getSales(cid, period, channel); }
    registerSale(cid, body) {
        return this.svc.registerSale(cid, body);
    }
    salesReport(cid, period) {
        return this.svc.getSalesReport(cid, period);
    }
};
exports.MacheteController = MacheteController;
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('inventory/pt'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getPT", null);
__decorate([
    (0, common_1.Get)('recipes'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getRecipes", null);
__decorate([
    (0, common_1.Get)('sales'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getSales", null);
__decorate([
    (0, common_1.Post)('sales'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "registerSale", null);
__decorate([
    (0, common_1.Get)('reports/sales'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "salesReport", null);
exports.MacheteController = MacheteController = __decorate([
    (0, swagger_1.ApiTags)('Machete'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('companies/:companyId/machete'),
    __metadata("design:paramtypes", [machete_service_1.MacheteService])
], MacheteController);
//# sourceMappingURL=machete.controller.js.map