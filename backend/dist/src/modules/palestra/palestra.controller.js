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
exports.PalestraController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../auth/auth.guards");
const palestra_service_1 = require("./palestra.service");
let PalestraController = class PalestraController {
    constructor(svc) {
        this.svc = svc;
    }
    dashboard(cid) { return this.svc.getDashboard(cid); }
    getServices(cid) { return this.svc.getServices(cid); }
    createService(cid, body) { return this.svc.createService(cid, body); }
    updateService(id, body) { return this.svc.updateService(id, body); }
    toggleService(id, body) { return this.svc.toggleService(id, body.isActive); }
    getMembershipTypes(cid) { return this.svc.getMembershipTypes(cid); }
    createMembershipType(cid, body) { return this.svc.createMembershipType(cid, body); }
    updateMembershipType(id, body) { return this.svc.updateMembershipType(id, body); }
    getMemberships(cid, q) { return this.svc.getMemberships(cid, q); }
    createMembership(cid, body) { return this.svc.createMembership(cid, body); }
    checkOverdue(cid) { return this.svc.checkAndBlockOverdue(cid); }
    addMember(id, body) { return this.svc.addMember(id, body); }
    removeMember(mid) { return this.svc.removeMember(mid); }
    getPayments(id) { return this.svc.getMembershipPayments(id); }
    registerPayment(id, body) { return this.svc.registerPayment(id, body); }
    getCommissions(cid, q) { return this.svc.getCommissions(cid, q); }
    createCommission(cid, body) { return this.svc.createCommission(cid, body); }
    releaseCommissions(cid, body) {
        return this.svc.releaseCommissions(cid, body.weekPeriod, body.employeeId);
    }
    freezeCommission(id, body) { return this.svc.freezeCommission(id, body.reason); }
    getSoftImports(cid) { return this.svc.getSoftImports(cid); }
    importSoft(cid, req, body) {
        return this.svc.importSoftRestaurant(cid, body, req.user.sub);
    }
    getLowStock(cid) { return this.svc.getLowStock(cid); }
    getProducts(cid) { return this.svc.getProducts(cid); }
    createProduct(cid, body) { return this.svc.createProduct(cid, body); }
    updateProduct(id, body) { return this.svc.updateProduct(id, body); }
    adjustStock(id, body) { return this.svc.adjustStock(id, body.qty, body.notes); }
    registerSale(cid, req, body) {
        return this.svc.registerSale(cid, req.user.sub, body);
    }
};
exports.PalestraController = PalestraController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('services'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getServices", null);
__decorate([
    (0, common_1.Post)('services'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "createService", null);
__decorate([
    (0, common_1.Put)('services/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "updateService", null);
__decorate([
    (0, common_1.Put)('services/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "toggleService", null);
__decorate([
    (0, common_1.Get)('membership-types'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getMembershipTypes", null);
__decorate([
    (0, common_1.Post)('membership-types'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "createMembershipType", null);
__decorate([
    (0, common_1.Put)('membership-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "updateMembershipType", null);
__decorate([
    (0, common_1.Get)('memberships'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getMemberships", null);
__decorate([
    (0, common_1.Post)('memberships'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "createMembership", null);
__decorate([
    (0, common_1.Post)('memberships/check-overdue'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "checkOverdue", null);
__decorate([
    (0, common_1.Post)('memberships/:id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)('memberships/members/:memberId'),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)('memberships/:id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Post)('memberships/:id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "registerPayment", null);
__decorate([
    (0, common_1.Get)('commissions'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getCommissions", null);
__decorate([
    (0, common_1.Post)('commissions'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "createCommission", null);
__decorate([
    (0, common_1.Post)('commissions/release'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "releaseCommissions", null);
__decorate([
    (0, common_1.Put)('commissions/:id/freeze'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "freezeCommission", null);
__decorate([
    (0, common_1.Get)('soft-imports'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getSoftImports", null);
__decorate([
    (0, common_1.Post)('soft-imports'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "importSoft", null);
__decorate([
    (0, common_1.Get)('products/low-stock'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getLowStock", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Put)('products/:id/stock'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Post)('sales'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PalestraController.prototype, "registerSale", null);
exports.PalestraController = PalestraController = __decorate([
    (0, common_1.Controller)('companies/:companyId/palestra'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [palestra_service_1.PalestraService])
], PalestraController);
//# sourceMappingURL=palestra.controller.js.map