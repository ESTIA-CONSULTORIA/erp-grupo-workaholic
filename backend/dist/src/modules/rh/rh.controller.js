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
const auth_guards_1 = require("../auth/auth.guards");
const rh_service_1 = require("./rh.service");
let RhController = class RhController {
    constructor(svc) {
        this.svc = svc;
    }
    myProfile(cid, req) {
        return this.svc.getMyProfile(cid, req.user.sub);
    }
    myRequest(cid, req, body) {
        return this.svc.getMyProfile(cid, req.user.sub).then(async (emp) => {
            if (!emp)
                throw new Error('No tienes un expediente vinculado');
            return this.svc.requestVacation(cid, emp.id, req.user.sub, body);
        });
    }
    async linkUser(id, body) {
        try {
            return await this.svc.linkUserToEmployee(id, body.userId);
        }
        catch (e) {
            console.error('linkUser error:', e.message, e.code);
            if (e.code === 'P2002') {
                throw { status: 400, message: 'Este usuario ya está vinculado a otro empleado' };
            }
            if (e.code === 'P2025') {
                throw { status: 404, message: 'Empleado no encontrado' };
            }
            if (e.message?.includes('Unknown field')) {
                throw { status: 500, message: 'El campo userId no existe en la BD. Corre npx prisma db push.' };
            }
            throw e;
        }
    }
    dashboard(cid) { return this.svc.getDashboard(cid); }
    findAll(cid, q) { return this.svc.findAllEmployees(cid, q); }
    create(cid, body) { return this.svc.createEmployee(cid, body); }
    findOne(id) { return this.svc.findOneEmployee(id); }
    update(id, body) { return this.svc.updateEmployee(id, body); }
    getDocuments(id) { return this.svc.getDocuments(id); }
    getMissing(id) { return this.svc.getMissingDocuments(id); }
    addDocument(cid, id, req, body) {
        return this.svc.addDocument(cid, id, req.user.sub, body);
    }
    balance(id) { return this.svc.getVacationBalance(id); }
    request(cid, id, req, body) {
        return this.svc.requestVacation(cid, id, req.user.sub, body);
    }
    getRequests(cid, req, role) {
        return this.svc.getRequests(cid, req.user.sub, role || 'rh');
    }
    updateVacation(id, body) { return this.svc.updateVacation(id, body); }
    approve(id, req, body) {
        return this.svc.approveVacation(id, req.user.sub, body.role || 'rh', body.approved, body.reason);
    }
    getEvents(id) { return this.svc.getEvents(id); }
    createEvent(cid, id, req, body) {
        return this.svc.createEvent(cid, id, req.user.sub, body);
    }
    getConfig(cid) { return this.svc.getHRConfig(cid); }
    upsertConfig(cid, body) { return this.svc.upsertHRConfig(cid, body); }
    cancelVacation(cid, vid, req) {
        return this.svc.cancelVacation(req.user.sub, vid);
    }
};
exports.RhController = RhController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "myProfile", null);
__decorate([
    (0, common_1.Post)('me/vacations'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "myRequest", null);
__decorate([
    (0, common_1.Put)('employees/:id/link-user'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RhController.prototype, "linkUser", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('employees'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "findAll", null);
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
    (0, common_1.Put)('employees/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('employees/:id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "getDocuments", null);
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
], RhController.prototype, "addDocument", null);
__decorate([
    (0, common_1.Get)('employees/:id/vacations/balance'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "balance", null);
__decorate([
    (0, common_1.Post)('employees/:id/vacations'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "request", null);
__decorate([
    (0, common_1.Get)('requests'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "getRequests", null);
__decorate([
    (0, common_1.Put)('vacations/:vacId'),
    __param(0, (0, common_1.Param)('vacId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "updateVacation", null);
__decorate([
    (0, common_1.Put)('vacations/:vacId/approve'),
    __param(0, (0, common_1.Param)('vacId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "approve", null);
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
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "upsertConfig", null);
__decorate([
    (0, common_1.Put)('me/vacations/:vacationId/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('vacationId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RhController.prototype, "cancelVacation", null);
exports.RhController = RhController = __decorate([
    (0, common_1.Controller)('companies/:companyId/rh'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [rh_service_1.RhService])
], RhController);
//# sourceMappingURL=rh.controller.js.map