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
exports.RhController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var auth_guards_1 = require("../auth/auth.guards");
var RhController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('RH'), (0, swagger_1.ApiBearerAuth)(), (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard), (0, common_1.Controller)('companies/:companyId/rh')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _dashboard_decorators;
    var _getConfig_decorators;
    var _updateConfig_decorators;
    var _list_decorators;
    var _create_decorators;
    var _findOne_decorators;
    var _getDocs_decorators;
    var _getMissing_decorators;
    var _addDoc_decorators;
    var _vacBalance_decorators;
    var _requestVac_decorators;
    var _approveVac_decorators;
    var _getEvents_decorators;
    var _createEvent_decorators;
    var RhController = _classThis = /** @class */ (function () {
        function RhController_1(svc) {
            this.svc = (__runInitializers(this, _instanceExtraInitializers), svc);
        }
        RhController_1.prototype.dashboard = function (cid) { return this.svc.getDashboard(cid); };
        RhController_1.prototype.getConfig = function (cid) { return this.svc.getHRConfig(cid); };
        RhController_1.prototype.updateConfig = function (cid, body) { return this.svc.upsertHRConfig(cid, body); };
        RhController_1.prototype.list = function (cid, q) { return this.svc.findAllEmployees(cid, q); };
        RhController_1.prototype.create = function (cid, body) { return this.svc.createEmployee(cid, body); };
        RhController_1.prototype.findOne = function (id) { return this.svc.findOneEmployee(id); };
        RhController_1.prototype.getDocs = function (id) { return this.svc.getDocuments(id); };
        RhController_1.prototype.getMissing = function (id) { return this.svc.getMissingDocuments(id); };
        RhController_1.prototype.addDoc = function (cid, eid, req, body) {
            return this.svc.addDocument(cid, eid, req.user.sub, body);
        };
        RhController_1.prototype.vacBalance = function (id) { return this.svc.getVacationBalance(id); };
        RhController_1.prototype.requestVac = function (cid, eid, body) {
            return this.svc.requestVacation(cid, eid, body);
        };
        RhController_1.prototype.approveVac = function (id, req, body) {
            return this.svc.approveVacation(id, req.user.sub, body.approved);
        };
        RhController_1.prototype.getEvents = function (id) { return this.svc.getEvents(id); };
        RhController_1.prototype.createEvent = function (cid, eid, req, body) {
            return this.svc.createEvent(cid, eid, req.user.sub, body);
        };
        return RhController_1;
    }());
    __setFunctionName(_classThis, "RhController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _dashboard_decorators = [(0, common_1.Get)('dashboard')];
        _getConfig_decorators = [(0, common_1.Get)('config')];
        _updateConfig_decorators = [(0, common_1.Put)('config')];
        _list_decorators = [(0, common_1.Get)('employees')];
        _create_decorators = [(0, common_1.Post)('employees')];
        _findOne_decorators = [(0, common_1.Get)('employees/:id')];
        _getDocs_decorators = [(0, common_1.Get)('employees/:id/documents')];
        _getMissing_decorators = [(0, common_1.Get)('employees/:id/documents/missing')];
        _addDoc_decorators = [(0, common_1.Post)('employees/:id/documents')];
        _vacBalance_decorators = [(0, common_1.Get)('employees/:id/vacations/balance')];
        _requestVac_decorators = [(0, common_1.Post)('employees/:id/vacations')];
        _approveVac_decorators = [(0, common_1.Put)('vacations/:vacId/approve')];
        _getEvents_decorators = [(0, common_1.Get)('employees/:id/events')];
        _createEvent_decorators = [(0, common_1.Post)('employees/:id/events')];
        __esDecorate(_classThis, null, _dashboard_decorators, { kind: "method", name: "dashboard", static: false, private: false, access: { has: function (obj) { return "dashboard" in obj; }, get: function (obj) { return obj.dashboard; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getConfig_decorators, { kind: "method", name: "getConfig", static: false, private: false, access: { has: function (obj) { return "getConfig" in obj; }, get: function (obj) { return obj.getConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateConfig_decorators, { kind: "method", name: "updateConfig", static: false, private: false, access: { has: function (obj) { return "updateConfig" in obj; }, get: function (obj) { return obj.updateConfig; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: function (obj) { return "list" in obj; }, get: function (obj) { return obj.list; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getDocs_decorators, { kind: "method", name: "getDocs", static: false, private: false, access: { has: function (obj) { return "getDocs" in obj; }, get: function (obj) { return obj.getDocs; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getMissing_decorators, { kind: "method", name: "getMissing", static: false, private: false, access: { has: function (obj) { return "getMissing" in obj; }, get: function (obj) { return obj.getMissing; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _addDoc_decorators, { kind: "method", name: "addDoc", static: false, private: false, access: { has: function (obj) { return "addDoc" in obj; }, get: function (obj) { return obj.addDoc; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _vacBalance_decorators, { kind: "method", name: "vacBalance", static: false, private: false, access: { has: function (obj) { return "vacBalance" in obj; }, get: function (obj) { return obj.vacBalance; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _requestVac_decorators, { kind: "method", name: "requestVac", static: false, private: false, access: { has: function (obj) { return "requestVac" in obj; }, get: function (obj) { return obj.requestVac; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _approveVac_decorators, { kind: "method", name: "approveVac", static: false, private: false, access: { has: function (obj) { return "approveVac" in obj; }, get: function (obj) { return obj.approveVac; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getEvents_decorators, { kind: "method", name: "getEvents", static: false, private: false, access: { has: function (obj) { return "getEvents" in obj; }, get: function (obj) { return obj.getEvents; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createEvent_decorators, { kind: "method", name: "createEvent", static: false, private: false, access: { has: function (obj) { return "createEvent" in obj; }, get: function (obj) { return obj.createEvent; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RhController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RhController = _classThis;
}();
exports.RhController = RhController;
