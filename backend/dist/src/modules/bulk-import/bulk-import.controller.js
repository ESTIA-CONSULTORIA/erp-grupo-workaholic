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
exports.BulkImportController = void 0;
const common_1 = require("@nestjs/common");
const bulk_import_service_1 = require("./bulk-import.service");
let BulkImportController = class BulkImportController {
    constructor(svc) {
        this.svc = svc;
    }
    importGastos(cid, body) {
        return this.svc.importGastos(cid, body.rows);
    }
    importProveedores(cid, body) {
        return this.svc.importProveedores(cid, body.rows);
    }
    importClientes(cid, body) {
        return this.svc.importClientes(cid, body.rows);
    }
    importProductos(cid, body) {
        return this.svc.importProductos(cid, body.rows);
    }
    importInsumos(cid, body) {
        return this.svc.importInsumos(cid, body.rows);
    }
    importEmpleados(cid, body) {
        return this.svc.importEmpleados(cid, body.rows);
    }
    importCxC(cid, body) {
        return this.svc.importCxC(cid, body.rows);
    }
    importCxP(cid, body) {
        return this.svc.importCxP(cid, body.rows);
    }
    importCompras(cid, body) {
        return this.svc.importCompras(cid, body.rows);
    }
};
exports.BulkImportController = BulkImportController;
__decorate([
    (0, common_1.Post)('gastos'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importGastos", null);
__decorate([
    (0, common_1.Post)('proveedores'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importProveedores", null);
__decorate([
    (0, common_1.Post)('clientes'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importClientes", null);
__decorate([
    (0, common_1.Post)('productos'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importProductos", null);
__decorate([
    (0, common_1.Post)('insumos'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importInsumos", null);
__decorate([
    (0, common_1.Post)('empleados'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importEmpleados", null);
__decorate([
    (0, common_1.Post)('cxc'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importCxC", null);
__decorate([
    (0, common_1.Post)('cxp'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importCxP", null);
__decorate([
    (0, common_1.Post)('compras'),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BulkImportController.prototype, "importCompras", null);
exports.BulkImportController = BulkImportController = __decorate([
    (0, common_1.Controller)('api/v1/companies/:companyId/import'),
    __metadata("design:paramtypes", [bulk_import_service_1.BulkImportService])
], BulkImportController);
//# sourceMappingURL=bulk-import.controller.js.map