"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacheteController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var auth_guards_1 = require("../auth/auth.guards");
var MacheteController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Machete'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard), (0, common_1.Controller)('companies/:companyId/machete')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getProducts_decorators;
    var _getLotes_decorators;
    var _crearLote_decorators;
    var _salida_decorators;
    var _empaque_decorators;
    var _cerrar_decorators;
    var _updateProduct_decorators;
    var _getPT_decorators;
    var _getInsumos_decorators;
    var _getRecipes_decorators;
    var _getSales_decorators;
    var _registerSale_decorators;
    var _salesReport_decorators;
    var MacheteController = _classThis = /** @class */ (function () {
        function MacheteController_1(svc) {
            this.svc = (__runInitializers(this, _instanceExtraInitializers), svc);
        }
        MacheteController_1.prototype.getProducts = function (cid) { return this.svc.getProducts(cid); };
        MacheteController_1.prototype.getLotes = function (cid) {
            return this.svc.getLotes(cid);
        };
        MacheteController_1.prototype.crearLote = function (cid, body, req) {
            return this.svc.crearLote(cid, req.user.sub, body);
        };
        MacheteController_1.prototype.salida = function (id, body) {
            return this.svc.registrarSalidaHorno(id, body);
        };
        MacheteController_1.prototype.empaque = function (id, body) {
            return this.svc.registrarEmpaque(id, body);
        };
        MacheteController_1.prototype.cerrar = function (id) {
            return this.svc.cerrarLote(id);
        };
        MacheteController_1.prototype.updateProduct = function (id, body) {
            return this.svc.updateProduct(id, body);
        };
        MacheteController_1.prototype.getPT = function (cid) { return this.svc.getPTInventory(cid); };
        MacheteController_1.prototype.getInsumos = function (cid) {
            return this.svc.getInsumos(cid);
        };
        MacheteController_1.prototype.getRecipes = function (cid) { return this.svc.getRecipes(cid); };
        MacheteController_1.prototype.getSales = function (cid, period, channel, startDate, endDate) { return this.svc.getSales(cid, period, channel, startDate, endDate); };
        MacheteController_1.prototype.registerSale = function (cid, body) {
            return this.svc.registerSale(cid, body);
        };
        MacheteController_1.prototype.salesReport = function (cid, period) {
            return this.svc.getSales(cid, period);
        };
        return MacheteController_1;
    }());
    __setFunctionName(_classThis, "MacheteController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getProducts_decorators = [(0, common_1.Get)('products')];
        _getLotes_decorators = [(0, common_1.Get)('lotes')];
        _crearLote_decorators = [(0, common_1.Post)('lotes')];
        _salida_decorators = [(0, common_1.Put)('lotes/:loteId/salida-horno')];
        _empaque_decorators = [(0, common_1.Put)('lotes/:loteId/empaque')];
        _cerrar_decorators = [(0, common_1.Put)('lotes/:loteId/cerrar')];
        _updateProduct_decorators = [(0, common_1.Put)('products/:productId')];
        _getPT_decorators = [(0, common_1.Get)('inventory/pt')];
        _getInsumos_decorators = [(0, common_1.Get)('insumos')];
        _getRecipes_decorators = [(0, common_1.Get)('recipes')];
        _getSales_decorators = [(0, common_1.Get)('sales')];
        _registerSale_decorators = [(0, common_1.Post)('sales')];
        _salesReport_decorators = [(0, common_1.Get)('reports/sales')];
        __esDecorate(_classThis, null, _getProducts_decorators, { kind: "method", name: "getProducts", static: false, private: false, access: { has: function (obj) { return "getProducts" in obj; }, get: function (obj) { return obj.getProducts; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getLotes_decorators, { kind: "method", name: "getLotes", static: false, private: false, access: { has: function (obj) { return "getLotes" in obj; }, get: function (obj) { return obj.getLotes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _crearLote_decorators, { kind: "method", name: "crearLote", static: false, private: false, access: { has: function (obj) { return "crearLote" in obj; }, get: function (obj) { return obj.crearLote; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _salida_decorators, { kind: "method", name: "salida", static: false, private: false, access: { has: function (obj) { return "salida" in obj; }, get: function (obj) { return obj.salida; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _empaque_decorators, { kind: "method", name: "empaque", static: false, private: false, access: { has: function (obj) { return "empaque" in obj; }, get: function (obj) { return obj.empaque; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cerrar_decorators, { kind: "method", name: "cerrar", static: false, private: false, access: { has: function (obj) { return "cerrar" in obj; }, get: function (obj) { return obj.cerrar; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateProduct_decorators, { kind: "method", name: "updateProduct", static: false, private: false, access: { has: function (obj) { return "updateProduct" in obj; }, get: function (obj) { return obj.updateProduct; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getPT_decorators, { kind: "method", name: "getPT", static: false, private: false, access: { has: function (obj) { return "getPT" in obj; }, get: function (obj) { return obj.getPT; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getInsumos_decorators, { kind: "method", name: "getInsumos", static: false, private: false, access: { has: function (obj) { return "getInsumos" in obj; }, get: function (obj) { return obj.getInsumos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getRecipes_decorators, { kind: "method", name: "getRecipes", static: false, private: false, access: { has: function (obj) { return "getRecipes" in obj; }, get: function (obj) { return obj.getRecipes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSales_decorators, { kind: "method", name: "getSales", static: false, private: false, access: { has: function (obj) { return "getSales" in obj; }, get: function (obj) { return obj.getSales; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registerSale_decorators, { kind: "method", name: "registerSale", static: false, private: false, access: { has: function (obj) { return "registerSale" in obj; }, get: function (obj) { return obj.registerSale; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _salesReport_decorators, { kind: "method", name: "salesReport", static: false, private: false, access: { has: function (obj) { return "salesReport" in obj; }, get: function (obj) { return obj.salesReport; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MacheteController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MacheteController = _classThis;
}();
exports.MacheteController = MacheteController;
