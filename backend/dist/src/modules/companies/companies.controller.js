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
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const companies_service_1 = require("./companies.service");
const auth_guards_1 = require("../auth/auth.guards");
let CompaniesController = class CompaniesController {
    constructor(svc) {
        this.svc = svc;
    }
    findAll() { return this.svc.findAll(); }
    findOne(id) { return this.svc.findOne(id); }
    getUsers(id) {
        return this.svc.getUsers(id);
    }
    getClients(id) {
        return this.svc.getClients(id);
    }
    createClient(id, body) {
        return this.svc.createClient(id, body);
    }
    updateClient(clientId, body) {
        return this.svc.updateClient(clientId, body);
    }
    getClientDetail(clientId) {
        return this.svc.getClientDetail(clientId);
    }
    createOrden(cid, clientId, body) {
        return this.svc.createOrdenCompra(cid, clientId, body);
    }
    registrarSurtido(ordenId, body) {
        return this.svc.registrarSurtido(ordenId, body);
    }
    cancelarOC(ordenId, body) {
        return this.svc.cancelarOC(ordenId, body.motivo || '');
    }
    cerrarOC(ordenId) {
        return this.svc.cerrarOCParcial(ordenId);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/users'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id/clients'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "getClients", null);
__decorate([
    (0, common_1.Post)(':id/clients'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "createClient", null);
__decorate([
    (0, common_1.Put)(':id/clients/:clientId'),
    __param(0, (0, common_1.Param)('clientId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "updateClient", null);
__decorate([
    (0, common_1.Get)(':id/clients/:clientId'),
    __param(0, (0, common_1.Param)('clientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "getClientDetail", null);
__decorate([
    (0, common_1.Post)(':id/clients/:clientId/ordenes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('clientId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "createOrden", null);
__decorate([
    (0, common_1.Post)(':id/ordenes/:ordenId/surtidos'),
    __param(0, (0, common_1.Param)('ordenId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "registrarSurtido", null);
__decorate([
    (0, common_1.Put)(':id/ordenes/:ordenId/cancelar'),
    __param(0, (0, common_1.Param)('ordenId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "cancelarOC", null);
__decorate([
    (0, common_1.Put)(':id/ordenes/:ordenId/cerrar'),
    __param(0, (0, common_1.Param)('ordenId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompaniesController.prototype, "cerrarOC", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, swagger_1.ApiTags)('Companies'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('companies'),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map