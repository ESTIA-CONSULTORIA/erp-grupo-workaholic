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
exports.LoncheController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../auth/auth.guards");
const lonche_service_1 = require("./lonche.service");
let LoncheController = class LoncheController {
    constructor(svc) {
        this.svc = svc;
    }
    dashboard(cid) { return this.svc.getDashboard(cid); }
    getProducts(cid) { return this.svc.getProducts(cid); }
    createProduct(cid, body) { return this.svc.createProduct(cid, body); }
    updateProduct(id, body) { return this.svc.updateProduct(id, body); }
    getTurnos(cid) { return this.svc.getTurnos(cid); }
    getTurnoActivo(cid) { return this.svc.getTurnoActivo(cid); }
    abrirTurno(cid, req, body) {
        return this.svc.abrirTurno(cid, req.user.sub, body.cajeroName || req.user.email);
    }
    cerrarTurno(id, body) { return this.svc.cerrarTurno(id, body); }
    reabrirTurno(cid, id, req, body) {
        return this.svc.reabrirTurno(id, req.user.sub, body.motivo || '');
    }
    validarTurno(id, req) { return this.svc.validarTurno(id, req.user.sub); }
    crearSurtido(cid, turnoId, req, body) {
        return this.svc.crearSurtido(turnoId, cid, req.user.sub, body.items, body.type);
    }
    registrarVenta(cid, turnoId, body) {
        return this.svc.registrarVenta(cid, turnoId, body);
    }
    getStudents(cid, search) {
        return this.svc.getStudents(cid, search);
    }
    findByCode(cid, code) {
        return this.svc.findStudentByCode(cid, code);
    }
    createStudent(cid, body) { return this.svc.createStudent(cid, body); }
    updateStudent(id, body) { return this.svc.updateStudent(id, body); }
    recargar(cid, id, req, body) {
        return this.svc.recargar(cid, id, { ...body, rechargedById: req.user.sub });
    }
    getTransactions(cid, id) {
        return this.svc.getTransactions(cid, id);
    }
    reporteCooperativa(cid, desde, hasta) {
        return this.svc.getReporteCooperativa(cid, desde || new Date().toISOString().slice(0, 10), hasta || new Date().toISOString().slice(0, 10));
    }
    reporteTutor(cid, sid, desde, hasta) {
        return this.svc.getReporteTutor(cid, sid, desde || new Date().toISOString().slice(0, 10), hasta || new Date().toISOString().slice(0, 10));
    }
};
exports.LoncheController = LoncheController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Get)('turnos'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "getTurnos", null);
__decorate([
    (0, common_1.Get)('turnos/activo'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "getTurnoActivo", null);
__decorate([
    (0, common_1.Post)('turnos/abrir'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "abrirTurno", null);
__decorate([
    (0, common_1.Put)('turnos/:id/cerrar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "cerrarTurno", null);
__decorate([
    (0, common_1.Put)('turnos/:id/reabrir'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "reabrirTurno", null);
__decorate([
    (0, common_1.Put)('turnos/:id/validar'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "validarTurno", null);
__decorate([
    (0, common_1.Post)('turnos/:id/surtido'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "crearSurtido", null);
__decorate([
    (0, common_1.Post)('turnos/:id/ventas'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "registrarVenta", null);
__decorate([
    (0, common_1.Get)('students'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)('students/by-code/:code'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Post)('students'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "createStudent", null);
__decorate([
    (0, common_1.Put)('students/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Post)('students/:id/recargar'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "recargar", null);
__decorate([
    (0, common_1.Get)('students/:id/transactions'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('reportes/cooperativa'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('desde')),
    __param(2, (0, common_1.Query)('hasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "reporteCooperativa", null);
__decorate([
    (0, common_1.Get)('reportes/tutor/:studentId'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Query)('desde')),
    __param(3, (0, common_1.Query)('hasta')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], LoncheController.prototype, "reporteTutor", null);
exports.LoncheController = LoncheController = __decorate([
    (0, common_1.Controller)('companies/:companyId/lonche'),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    __metadata("design:paramtypes", [lonche_service_1.LoncheService])
], LoncheController);
//# sourceMappingURL=lonche.controller.js.map