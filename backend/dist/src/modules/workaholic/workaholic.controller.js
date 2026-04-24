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
exports.WorkaholicController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../auth/auth.guards");
const workaholic_service_1 = require("./workaholic.service");
let WorkaholicController = class WorkaholicController {
    constructor(svc) {
        this.svc = svc;
    }
    dashboard(cid) { return this.svc.getDashboard(cid); }
    getSpaces(cid) { return this.svc.getSpaces(cid); }
    createSpace(cid, body) { return this.svc.createSpace(cid, body); }
    updateSpace(id, body) { return this.svc.updateSpace(id, body); }
    getTypes(cid) { return this.svc.getMembershipTypes(cid); }
    createType(cid, body) { return this.svc.createMembershipType(cid, body); }
    updateType(id, body) { return this.svc.updateMembershipType(id, body); }
    getMemberships(cid, q) { return this.svc.getMemberships(cid, q); }
    createMembership(cid, body) { return this.svc.createMembership(cid, body); }
    checkExpired(cid) { return this.svc.checkExpired(cid); }
    registerPayment(id, body) { return this.svc.registerPayment(id, body); }
    getReservations(cid, q) { return this.svc.getReservations(cid, q); }
    createReservation(cid, body) { return this.svc.createReservation(cid, body); }
    updateReservation(id, body) { return this.svc.updateReservation(id, body); }
    registerSale(cid, body) { return this.svc.registerSale(cid, body); }
    getSoftImports(cid) { return this.svc.getSoftImports(cid); }
    importSoft(cid, req, body) {
        return this.svc.importSoftRestaurant(cid, body, req.user.sub);
    }
};
exports.WorkaholicController = WorkaholicController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('spaces'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "getSpaces", null);
__decorate([
    (0, common_1.Post)('spaces'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "createSpace", null);
__decorate([
    (0, common_1.Put)('spaces/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "updateSpace", null);
__decorate([
    (0, common_1.Get)('membership-types'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "getTypes", null);
__decorate([
    (0, common_1.Post)('membership-types'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "createType", null);
__decorate([
    (0, common_1.Put)('membership-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "updateType", null);
__decorate([
    (0, common_1.Get)('memberships'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "getMemberships", null);
__decorate([
    (0, common_1.Post)('memberships'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "createMembership", null);
__decorate([
    (0, common_1.Post)('memberships/check-expired'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "checkExpired", null);
__decorate([
    (0, common_1.Post)('memberships/:id/payments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "registerPayment", null);
__decorate([
    (0, common_1.Get)('reservations'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "getReservations", null);
__decorate([
    (0, common_1.Post)('reservations'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "createReservation", null);
__decorate([
    (0, common_1.Put)('reservations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "updateReservation", null);
__decorate([
    (0, common_1.Post)('sales'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "registerSale", null);
__decorate([
    (0, common_1.Get)('soft-imports'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "getSoftImports", null);
__decorate([
    (0, common_1.Post)('soft-imports'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkaholicController.prototype, "importSoft", null);
exports.WorkaholicController = WorkaholicController = __decorate([
    (0, common_1.Controller)('companies/:companyId/workaholic'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workaholic_service_1.WorkaholicService])
], WorkaholicController);
//# sourceMappingURL=workaholic.controller.js.map