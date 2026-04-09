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
exports.CorteCajaController = void 0;
var common_1 = require("@nestjs/common");
var auth_guards_1 = require("../auth/auth.guards");
var CorteCajaController = function () {
    var _classDecorators = [(0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard), (0, common_1.Controller)('api/v1/companies/:companyId/corte-caja')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _getCortes_decorators;
    var _crearCorte_decorators;
    var _validarCorte_decorators;
    var _rechazarCorte_decorators;
    var CorteCajaController = _classThis = /** @class */ (function () {
        function CorteCajaController_1(svc) {
            this.svc = (__runInitializers(this, _instanceExtraInitializers), svc);
        }
        CorteCajaController_1.prototype.getCortes = function (cid, status) {
            return this.svc.getCortes(cid, status);
        };
        CorteCajaController_1.prototype.crearCorte = function (cid, body, req) {
            return this.svc.crearCorte(cid, req.user.sub, body);
        };
        CorteCajaController_1.prototype.validarCorte = function (id, body, req) {
            return this.svc.validarCorte(id, req.user.sub, body);
        };
        CorteCajaController_1.prototype.rechazarCorte = function (id, body, req) {
            return this.svc.rechazarCorte(id, req.user.sub, body.notas);
        };
        return CorteCajaController_1;
    }());
    __setFunctionName(_classThis, "CorteCajaController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _getCortes_decorators = [(0, common_1.Get)()];
        _crearCorte_decorators = [(0, common_1.Post)()];
        _validarCorte_decorators = [(0, common_1.Put)(':corteId/validar')];
        _rechazarCorte_decorators = [(0, common_1.Put)(':corteId/rechazar')];
        __esDecorate(_classThis, null, _getCortes_decorators, { kind: "method", name: "getCortes", static: false, private: false, access: { has: function (obj) { return "getCortes" in obj; }, get: function (obj) { return obj.getCortes; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _crearCorte_decorators, { kind: "method", name: "crearCorte", static: false, private: false, access: { has: function (obj) { return "crearCorte" in obj; }, get: function (obj) { return obj.crearCorte; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _validarCorte_decorators, { kind: "method", name: "validarCorte", static: false, private: false, access: { has: function (obj) { return "validarCorte" in obj; }, get: function (obj) { return obj.validarCorte; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _rechazarCorte_decorators, { kind: "method", name: "rechazarCorte", static: false, private: false, access: { has: function (obj) { return "rechazarCorte" in obj; }, get: function (obj) { return obj.rechazarCorte; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CorteCajaController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CorteCajaController = _classThis;
}();
exports.CorteCajaController = CorteCajaController;
