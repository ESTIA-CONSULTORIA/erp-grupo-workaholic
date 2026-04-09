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
exports.CompaniesController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var auth_guards_1 = require("../auth/auth.guards");
var CompaniesController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Companies'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard), (0, common_1.Controller)('companies')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAll_decorators;
    var _findOne_decorators;
    var _getUsers_decorators;
    var _getClients_decorators;
    var _createClient_decorators;
    var _updateClient_decorators;
    var _getClientDetail_decorators;
    var _createOrden_decorators;
    var _registrarSurtido_decorators;
    var _cancelarOC_decorators;
    var _cerrarOC_decorators;
    var CompaniesController = _classThis = /** @class */ (function () {
        function CompaniesController_1(svc) {
            this.svc = (__runInitializers(this, _instanceExtraInitializers), svc);
        }
        CompaniesController_1.prototype.findAll = function () { return this.svc.findAll(); };
        CompaniesController_1.prototype.findOne = function (id) { return this.svc.findOne(id); };
        CompaniesController_1.prototype.getUsers = function (id) {
            return this.svc.getUsers(id);
        };
        CompaniesController_1.prototype.getClients = function (id) {
            return this.svc.getClients(id);
        };
        CompaniesController_1.prototype.createClient = function (id, body) {
            return this.svc.createClient(id, body);
        };
        CompaniesController_1.prototype.updateClient = function (clientId, body) {
            return this.svc.updateClient(clientId, body);
        };
        CompaniesController_1.prototype.getClientDetail = function (clientId) {
            return this.svc.getClientDetail(clientId);
        };
        CompaniesController_1.prototype.createOrden = function (cid, clientId, body) {
            return this.svc.createOrdenCompra(cid, clientId, body);
        };
        CompaniesController_1.prototype.registrarSurtido = function (ordenId, body) {
            return this.svc.registrarSurtido(ordenId, body);
        };
        CompaniesController_1.prototype.cancelarOC = function (ordenId, body) {
            return this.svc.cancelarOC(ordenId, body.motivo || '');
        };
        CompaniesController_1.prototype.cerrarOC = function (ordenId) {
            return this.svc.cerrarOCParcial(ordenId);
        };
        return CompaniesController_1;
    }());
    __setFunctionName(_classThis, "CompaniesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAll_decorators = [(0, common_1.Get)()];
        _findOne_decorators = [(0, common_1.Get)(':id')];
        _getUsers_decorators = [(0, common_1.Get)(':id/users')];
        _getClients_decorators = [(0, common_1.Get)(':id/clients')];
        _createClient_decorators = [(0, common_1.Post)(':id/clients')];
        _updateClient_decorators = [(0, common_1.Put)(':id/clients/:clientId')];
        _getClientDetail_decorators = [(0, common_1.Get)(':id/clients/:clientId')];
        _createOrden_decorators = [(0, common_1.Post)(':id/clients/:clientId/ordenes')];
        _registrarSurtido_decorators = [(0, common_1.Post)(':id/ordenes/:ordenId/surtidos')];
        _cancelarOC_decorators = [(0, common_1.Put)(':id/ordenes/:ordenId/cancelar')];
        _cerrarOC_decorators = [(0, common_1.Put)(':id/ordenes/:ordenId/cerrar')];
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getUsers_decorators, { kind: "method", name: "getUsers", static: false, private: false, access: { has: function (obj) { return "getUsers" in obj; }, get: function (obj) { return obj.getUsers; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getClients_decorators, { kind: "method", name: "getClients", static: false, private: false, access: { has: function (obj) { return "getClients" in obj; }, get: function (obj) { return obj.getClients; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createClient_decorators, { kind: "method", name: "createClient", static: false, private: false, access: { has: function (obj) { return "createClient" in obj; }, get: function (obj) { return obj.createClient; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateClient_decorators, { kind: "method", name: "updateClient", static: false, private: false, access: { has: function (obj) { return "updateClient" in obj; }, get: function (obj) { return obj.updateClient; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getClientDetail_decorators, { kind: "method", name: "getClientDetail", static: false, private: false, access: { has: function (obj) { return "getClientDetail" in obj; }, get: function (obj) { return obj.getClientDetail; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createOrden_decorators, { kind: "method", name: "createOrden", static: false, private: false, access: { has: function (obj) { return "createOrden" in obj; }, get: function (obj) { return obj.createOrden; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _registrarSurtido_decorators, { kind: "method", name: "registrarSurtido", static: false, private: false, access: { has: function (obj) { return "registrarSurtido" in obj; }, get: function (obj) { return obj.registrarSurtido; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cancelarOC_decorators, { kind: "method", name: "cancelarOC", static: false, private: false, access: { has: function (obj) { return "cancelarOC" in obj; }, get: function (obj) { return obj.cancelarOC; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _cerrarOC_decorators, { kind: "method", name: "cerrarOC", static: false, private: false, access: { has: function (obj) { return "cerrarOC" in obj; }, get: function (obj) { return obj.cerrarOC; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CompaniesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CompaniesController = _classThis;
}();
exports.CompaniesController = CompaniesController;
