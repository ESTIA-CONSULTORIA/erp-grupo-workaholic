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
exports.CorteCajaController = void 0;
const common_1 = require("@nestjs/common");
const corte_caja_service_1 = require("./corte-caja.service");
const auth_guards_1 = require("../auth/auth.guards");
let CorteCajaController = class CorteCajaController {
    constructor(svc) {
        this.svc = svc;
    }
    getCortes(cid, status) {
        return this.svc.getCortes(cid, status);
    }
    getVentasDelDia(cid, fecha) {
        return this.svc.getVentasDelDia(cid, fecha || new Date().toISOString().slice(0, 10));
    }
    crearCorte(cid, body, req) {
        return this.svc.crearCorte(cid, req.user.sub, body);
    }
    validar(id, body, req) {
        return this.svc.validarCorte(id, req.user.sub, body);
    }
    rechazar(id, body, req) {
        return this.svc.rechazarCorte(id, req.user.sub, body.notas || '');
    }
    responder(id, body, req) {
        return this.svc.responderCorte(id, req.user.sub, body.respuesta || '', body.ticketUrl, body.ticketNombre);
    }
};
exports.CorteCajaController = CorteCajaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CorteCajaController.prototype, "getCortes", null);
__decorate([
    (0, common_1.Get)('ventas-del-dia'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('fecha')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CorteCajaController.prototype, "getVentasDelDia", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CorteCajaController.prototype, "crearCorte", null);
__decorate([
    (0, common_1.Put)(':corteId/validar'),
    __param(0, (0, common_1.Param)('corteId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CorteCajaController.prototype, "validar", null);
__decorate([
    (0, common_1.Put)(':corteId/rechazar'),
    __param(0, (0, common_1.Param)('corteId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CorteCajaController.prototype, "rechazar", null);
__decorate([
    (0, common_1.Put)(':corteId/responder'),
    __param(0, (0, common_1.Param)('corteId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CorteCajaController.prototype, "responder", null);
exports.CorteCajaController = CorteCajaController = __decorate([
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('companies/:companyId/corte-caja'),
    __metadata("design:paramtypes", [corte_caja_service_1.CorteCajaService])
], CorteCajaController);
//# sourceMappingURL=corte-caja.controller.js.map