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
    getLotes(cid) {
        return this.svc.getLotes(cid);
    }
    crearLote(cid, body, req) {
        return this.svc.crearLote(cid, req.user.sub, body);
    }
    salida(id, body) {
        return this.svc.registrarSalidaHorno(id, body);
    }
    empaque(id, body) {
        return this.svc.registrarEmpaque(id, body);
    }
    cerrar(id) {
        return this.svc.cerrarLote(id);
    }
    updateProduct(id, body) {
        return this.svc.updateProduct(id, body);
    }
    updateStockLimits(id, body) {
        return this.svc.updateProductStock(id, body);
    }
    getPT(cid) { return this.svc.getPTInventory(cid); }
    getInsumos(cid) {
        return this.svc.getInsumos(cid);
    }
    comprarInsumo(cid, body) {
        return this.svc.comprarInsumo(cid, body);
    }
    createProduct(cid, body) {
        return this.svc.createProduct(cid, body);
    }
    createInsumo(cid, body) {
        return this.svc.createInsumo(cid, body);
    }
    updateInsumo(id, body) {
        return this.svc.updateInsumo(id, body);
    }
    getRecipes(cid) { return this.svc.getRecipes(cid); }
    getSales(cid, period, channel, startDate, endDate) { return this.svc.getSales(cid, period, channel, startDate, endDate); }
    registerSale(cid, body) {
        return this.svc.registerSale(cid, body);
    }
    salesReport(cid, period) {
        return this.svc.getSales(cid, period);
    }
    cancelarCompra(cid, compraId) {
        return this.svc.cancelarCompra(cid, compraId);
    }
    getCompras(cid, proveedorId, fechaIni, fechaFin, status) {
        return this.svc.getCompras(cid, { proveedorId, fechaIni, fechaFin, status });
    }
    crearCompra(cid, body, req) {
        return this.svc.crearCompra(cid, req.user.sub, body);
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
    (0, common_1.Get)('lotes'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getLotes", null);
__decorate([
    (0, common_1.Post)('lotes'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "crearLote", null);
__decorate([
    (0, common_1.Put)('lotes/:loteId/salida-horno'),
    __param(0, (0, common_1.Param)('loteId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "salida", null);
__decorate([
    (0, common_1.Put)('lotes/:loteId/empaque'),
    __param(0, (0, common_1.Param)('loteId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "empaque", null);
__decorate([
    (0, common_1.Put)('lotes/:loteId/cerrar'),
    __param(0, (0, common_1.Param)('loteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "cerrar", null);
__decorate([
    (0, common_1.Put)('products/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Put)('products/:productId/stock-limits'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "updateStockLimits", null);
__decorate([
    (0, common_1.Get)('inventory/pt'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getPT", null);
__decorate([
    (0, common_1.Get)('insumos'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getInsumos", null);
__decorate([
    (0, common_1.Post)('insumos/compra'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "comprarInsumo", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "createProduct", null);
__decorate([
    (0, common_1.Post)('insumos'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "createInsumo", null);
__decorate([
    (0, common_1.Put)('insumos/:insumoId'),
    __param(0, (0, common_1.Param)('insumoId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "updateInsumo", null);
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
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
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
__decorate([
    (0, common_1.Put)('compras/:compraId/cancelar'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Param)('compraId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "cancelarCompra", null);
__decorate([
    (0, common_1.Get)('compras'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Query)('proveedorId')),
    __param(2, (0, common_1.Query)('fechaIni')),
    __param(3, (0, common_1.Query)('fechaFin')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "getCompras", null);
__decorate([
    (0, common_1.Post)('compras'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], MacheteController.prototype, "crearCompra", null);
exports.MacheteController = MacheteController = __decorate([
    (0, swagger_1.ApiTags)('Machete'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('companies/:companyId/machete'),
    __metadata("design:paramtypes", [machete_service_1.MacheteService])
], MacheteController);
//# sourceMappingURL=machete.controller.js.map