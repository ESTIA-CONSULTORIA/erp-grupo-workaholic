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
exports.RhController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guards_1 = require("../auth/auth.guards");
const rh_service_1 = require("./rh.service");
let RhController = class RhController {
    constructor(svc) {
        this.svc = svc;
    }
    dashboard(cid) { return this.svc.getDashboard(cid); }
    getConfig(cid) { return this.svc.getHRConfig(cid); }
    updateConfig(cid, body) { return this.svc.upsertHRConfig(cid, body); }
    list(cid, q) { return this.svc.findAllEmployees(cid, q); }
    create(cid, body) { return this.svc.createEmployee(cid, body); }
    findOne(id) { return this.svc.findOneEmployee(id); }
    getDocs(id) { return this.svc.getDocuments(id); }
    getMissing(id) { return this.svc.getMissingDocuments(id); }
    addDoc(cid, eid, req, body) {
        return this.svc.addDocument(cid, eid, req.user.sub, body);
    }
    vacBalance(id) { return this.svc.getVacationBalance(id); }
    requestVac(cid, eid, body) {
        return this.svc.requestVacation(cid, eid, body);
    }
    approveVac(id, req, body) {
        return this.svc.approveVacation(id, req.user.sub, body.approved);
    }
    getEvents(id) { return this.svc.getEvents(id); }
    createEvent(cid, eid, req, body) {
        return this.svc.createEvent(cid, eid, req.user.sub, body);
    }
};
exports.RhController = RhController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('employees'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('employees'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('employees/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('employees/:id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "getDocs", null);
__decorate([
    (0, common_1.Get)('employees/:id/documents/missing'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "getMissing", null);
__decorate([
    (0, common_1.Post)('employees/:id/documents'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "addDoc", null);
__decorate([
    (0, common_1.Get)('employees/:id/vacations/balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "vacBalance", null);
__decorate([
    (0, common_1.Post)('employees/:id/vacations'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "requestVac", null);
__decorate([
    (0, common_1.Put)('vacations/:vacId/approve'),
    __param(0, (0, common_1.Param)('vacId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "approveVac", null);
__decorate([
    (0, common_1.Get)('employees/:id/events'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "getEvents", null);
__decorate([
    (0, common_1.Post)('employees/:id/events'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "createEvent", null);
exports.RhController = RhController = __decorate([
    (0, swagger_1.ApiTags)('RH'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('companies/:companyId/rh'),
    __metadata("design:paramtypes", [rh_service_1.RhService])
], RhController);
//# sourceMappingURL=rh.controller.js.map