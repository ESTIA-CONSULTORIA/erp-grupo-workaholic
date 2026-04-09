"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacheteService = void 0;
var common_1 = require("@nestjs/common");
var MacheteService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var MacheteService = _classThis = /** @class */ (function () {
        function MacheteService_1(prisma) {
            this.prisma = prisma;
        }
        MacheteService_1.prototype.getProducts = function (companyId) {
            return this.prisma.product.findMany({
                where: { companyId: companyId },
                include: { currentStock: true },
                orderBy: [{ meatType: 'asc' }, { flavor: 'asc' }],
            });
        };
        // ── PRODUCCIÓN ────────────────────────────────────────────
        MacheteService_1.prototype.getLotes = function (companyId) {
            return this.prisma.loteProduccion.findMany({
                where: { companyId: companyId },
                include: {
                    insumos: true,
                    empaques: { include: { product: true } },
                },
                orderBy: { fecha: 'desc' },
            });
        };
        MacheteService_1.prototype.crearLote = function (companyId, userId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var lote;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.loteProduccion.create({
                                data: {
                                    companyId: companyId,
                                    fecha: new Date(data.fecha),
                                    tipo: data.tipo,
                                    kgEntrada: data.kgEntrada || 0,
                                    notas: data.notas || null,
                                    creadoPor: userId,
                                    status: 'EN_PROCESO',
                                },
                            })];
                        case 1:
                            lote = _a.sent();
                            return [2 /*return*/, lote];
                    }
                });
            });
        };
        MacheteService_1.prototype.registrarSalidaHorno = function (loteId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var lote, kgEntrada, kgSalida, kgGrasa, kgEscarchado, kgMerma, rendimiento;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.loteProduccion.findUnique({ where: { id: loteId } })];
                        case 1:
                            lote = _a.sent();
                            if (!lote)
                                throw new Error('Lote no encontrado');
                            kgEntrada = Number(lote.kgEntrada);
                            kgSalida = Number(data.kgSalida || 0);
                            kgGrasa = Number(data.kgGrasa || 0);
                            kgEscarchado = Number(data.kgEscarchado || 0);
                            kgMerma = kgEntrada - kgSalida - kgGrasa;
                            rendimiento = kgEntrada > 0 ? (kgSalida / kgEntrada) * 100 : 0;
                            return [2 /*return*/, this.prisma.loteProduccion.update({
                                    where: { id: loteId },
                                    data: {
                                        kgSalida: kgSalida,
                                        kgGrasa: kgGrasa,
                                        kgEscarchado: kgEscarchado,
                                        kgMerma: kgMerma,
                                        rendimiento: rendimiento,
                                        status: 'EN_PROCESO',
                                    },
                                })];
                    }
                });
            });
        };
        MacheteService_1.prototype.registrarEmpaque = function (loteId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, _a, linea;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _i = 0, _a = data.lineas;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            linea = _a[_i];
                            return [4 /*yield*/, this.prisma.loteEmpaque.create({
                                    data: {
                                        loteId: loteId,
                                        productId: linea.productId,
                                        cantidad: linea.cantidad,
                                        costoUnit: linea.costoUnit || 0,
                                    },
                                })];
                        case 2:
                            _b.sent();
                            // Actualizar inventario de producto terminado
                            return [4 /*yield*/, this.prisma.productStock.updateMany({
                                    where: { productId: linea.productId },
                                    data: { stock: { increment: linea.cantidad } },
                                })];
                        case 3:
                            // Actualizar inventario de producto terminado
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 1];
                        case 5: return [2 /*return*/, this.prisma.loteProduccion.update({
                                where: { id: loteId },
                                data: { status: 'EMPACADO' },
                            })];
                    }
                });
            });
        };
        MacheteService_1.prototype.cerrarLote = function (loteId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.loteProduccion.update({
                            where: { id: loteId },
                            data: { status: 'CERRADO' },
                        })];
                });
            });
        };
        MacheteService_1.prototype.updateProduct = function (productId, data) {
            return this.prisma.product.update({
                where: { id: productId },
                data: {
                    priceMostrador: data.priceMostrador !== undefined ? Number(data.priceMostrador) : undefined,
                    priceMayoreo: data.priceMayoreo !== undefined ? Number(data.priceMayoreo) : undefined,
                    priceOnline: data.priceOnline !== undefined ? Number(data.priceOnline) : undefined,
                    priceML: data.priceML !== undefined ? Number(data.priceML) : undefined,
                    name: data.name || undefined,
                    isActive: data.isActive !== undefined ? data.isActive : undefined,
                },
            });
        };
        MacheteService_1.prototype.getPTInventory = function (companyId) {
            return __awaiter(this, void 0, void 0, function () {
                var products;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.product.findMany({
                                where: { companyId: companyId, isActive: true },
                                include: { currentStock: true },
                            })];
                        case 1:
                            products = _a.sent();
                            return [2 /*return*/, products.map(function (p) {
                                    var _a, _b, _c, _d;
                                    return (__assign(__assign({}, p), { stock: ((_a = p.currentStock) === null || _a === void 0 ? void 0 : _a.stock) || 0, minStock: ((_b = p.currentStock) === null || _b === void 0 ? void 0 : _b.minStock) || 5, lowStock: (((_c = p.currentStock) === null || _c === void 0 ? void 0 : _c.stock) || 0) < (((_d = p.currentStock) === null || _d === void 0 ? void 0 : _d.minStock) || 5) }));
                                })];
                    }
                });
            });
        };
        MacheteService_1.prototype.getInsumos = function (companyId) {
            return this.prisma.insumo.findMany({
                where: { companyId: companyId, isActive: true },
                orderBy: [{ group: 'asc' }, { name: 'asc' }],
            });
        };
        MacheteService_1.prototype.getRecipes = function (companyId) {
            return this.prisma.recipe.findMany({
                where: { companyId: companyId, isActive: true },
                include: { ingredients: true },
                orderBy: { key: 'asc' },
            });
        };
        MacheteService_1.prototype.getSales = function (companyId, period, channel, startDate, endDate) {
            var where = { companyId: companyId };
            if (channel)
                where.channel = channel;
            if (startDate && endDate) {
                where.date = { gte: new Date(startDate), lte: new Date(endDate) };
            }
            else if (period) {
                var _a = period.split('-').map(Number), y = _a[0], m = _a[1];
                where.date = { gte: new Date(y, m - 1, 1), lte: new Date(y, m, 0) };
            }
            return this.prisma.sale.findMany({
                where: where,
                include: {
                    lines: { include: { product: true } },
                    client: { select: { id: true, name: true } },
                },
                orderBy: { date: 'desc' },
            });
        };
        MacheteService_1.prototype.registerSale = function (companyId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var total, sale, saleDate, dueDate, cxc, e_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log('SALE DATA:', JSON.stringify({ isCredit: data.isCredit, paymentMethod: data.paymentMethod, clientId: data.clientId }));
                            total = data.lines.reduce(function (t, l) { return t + l.quantity * l.unitPrice; }, 0);
                            return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var s, _i, _a, line;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, tx.sale.create({
                                                    data: {
                                                        companyId: companyId,
                                                        date: new Date(data.date),
                                                        channel: data.channel,
                                                        clientName: data.clientName || null,
                                                        clientId: data.clientId || null,
                                                        isCredit: data.isCredit || false,
                                                        total: total,
                                                        paymentMethod: data.paymentMethod || 'efectivo',
                                                        lines: {
                                                            create: data.lines.map(function (l) { return ({
                                                                productId: l.productId,
                                                                quantity: l.quantity,
                                                                unitPrice: l.unitPrice,
                                                                total: l.quantity * l.unitPrice,
                                                            }); }),
                                                        },
                                                    },
                                                    include: { lines: { include: { product: true } } },
                                                })];
                                            case 1:
                                                s = _b.sent();
                                                _i = 0, _a = s.lines;
                                                _b.label = 2;
                                            case 2:
                                                if (!(_i < _a.length)) return [3 /*break*/, 5];
                                                line = _a[_i];
                                                return [4 /*yield*/, tx.productStock.updateMany({
                                                        where: { productId: line.productId },
                                                        data: { stock: { decrement: line.quantity } },
                                                    })];
                                            case 3:
                                                _b.sent();
                                                _b.label = 4;
                                            case 4:
                                                _i++;
                                                return [3 /*break*/, 2];
                                            case 5: return [2 /*return*/, s];
                                        }
                                    });
                                }); })];
                        case 1:
                            sale = _a.sent();
                            if (!((data.isCredit === true || data.isCredit === 'true' || data.paymentMethod === 'credito') && data.clientId)) return [3 /*break*/, 5];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            saleDate = new Date(data.date);
                            saleDate.setHours(0, 0, 0, 0);
                            dueDate = new Date(saleDate);
                            dueDate.setDate(dueDate.getDate() + 30);
                            return [4 /*yield*/, this.prisma.receivable.create({
                                    data: {
                                        companyId: companyId,
                                        clientId: data.clientId,
                                        date: saleDate,
                                        dueDate: dueDate,
                                        originalAmount: total,
                                        paidAmount: 0,
                                        balance: total,
                                        currency: 'MXN',
                                        status: 'PENDIENTE',
                                    },
                                })];
                        case 3:
                            cxc = _a.sent();
                            console.log('CXC CREADO:', cxc.id);
                            return [3 /*break*/, 5];
                        case 4:
                            e_1 = _a.sent();
                            console.error('ERROR CXC:', e_1.message);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/, sale];
                    }
                });
            });
        };
        return MacheteService_1;
    }());
    __setFunctionName(_classThis, "MacheteService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        MacheteService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return MacheteService = _classThis;
}();
exports.MacheteService = MacheteService;
