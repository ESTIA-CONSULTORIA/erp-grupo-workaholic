"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
var common_1 = require("@nestjs/common");
var ExpensesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var ExpensesService = _classThis = /** @class */ (function () {
        function ExpensesService_1(prisma) {
            this.prisma = prisma;
        }
        ExpensesService_1.prototype.findAll = function (companyId, period, isExternal) {
            var where = { companyId: companyId };
            if (isExternal !== undefined)
                where.isExternal = isExternal === 'true';
            if (period) {
                var _a = period.split('-').map(Number), y = _a[0], m = _a[1];
                where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
            }
            return this.prisma.expense.findMany({
                where: where,
                include: { rubric: true, supplier: true },
                orderBy: { date: 'desc' },
            });
        };
        ExpensesService_1.prototype.create = function (companyId, userId, data) {
            return this.prisma.expense.create({
                data: {
                    companyId: companyId,
                    rubricId: data.rubricId || null,
                    supplierId: data.supplierId || null,
                    cashAccountId: data.cashAccountId || null,
                    date: new Date(data.date),
                    concept: data.concept,
                    subtotal: data.subtotal || 0,
                    tax: data.tax || 0,
                    total: (data.subtotal || 0) + (data.tax || 0),
                    currency: data.currency || 'MXN',
                    paymentMethod: data.paymentMethod || 'efectivo',
                    paymentStatus: data.paymentStatus || 'PAGADO',
                    invoiceRef: data.invoiceRef || null,
                    userId: userId,
                    totalMxn: (data.subtotal || 0) + (data.tax || 0),
                    exchangeRate: 1,
                    isExternal: data.isExternal || false,
                    externalNotes: data.externalNotes || null,
                },
                include: { rubric: true, supplier: true },
            });
        };
        ExpensesService_1.prototype.delete = function (id) {
            return this.prisma.expense.delete({ where: { id: id } });
        };
        return ExpensesService_1;
    }());
    __setFunctionName(_classThis, "ExpensesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ExpensesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ExpensesService = _classThis;
}();
exports.ExpensesService = ExpensesService;
