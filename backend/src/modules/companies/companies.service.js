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
exports.CompaniesService = void 0;
var common_1 = require("@nestjs/common");
var CompaniesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var CompaniesService = _classThis = /** @class */ (function () {
        function CompaniesService_1(prisma) {
            this.prisma = prisma;
        }
        CompaniesService_1.prototype.findAll = function () {
            return this.prisma.company.findMany({ orderBy: { name: 'asc' } });
        };
        CompaniesService_1.prototype.findOne = function (id) {
            return this.prisma.company.findUnique({
                where: { id: id },
                include: { branches: true },
            });
        };
        CompaniesService_1.prototype.getUsers = function (companyId) {
            return this.prisma.userCompanyRole.findMany({
                where: { companyId: companyId },
                include: {
                    user: { select: { id: true, name: true, email: true, isActive: true } },
                    role: true,
                },
            });
        };
        CompaniesService_1.prototype.getClients = function (companyId) {
            return this.prisma.client.findMany({
                where: { companyId: companyId, isActive: true },
                include: { _count: { select: { ordenesCompra: true } } },
                orderBy: { name: 'asc' },
            });
        };
        CompaniesService_1.prototype.createClient = function (companyId, data) {
            return this.prisma.client.create({
                data: {
                    companyId: companyId,
                    name: data.name,
                    rfc: data.rfc || null,
                    phone: data.phone || null,
                    email: data.email || null,
                    address: data.address || null,
                    creditLimit: data.creditLimit || 0,
                    creditDays: data.creditDays || 0,
                    isActive: true,
                },
            });
        };
        CompaniesService_1.prototype.updateClient = function (clientId, data) {
            return this.prisma.client.update({
                where: { id: clientId },
                data: {
                    name: data.name,
                    rfc: data.rfc || null,
                    phone: data.phone || null,
                    email: data.email || null,
                    address: data.address || null,
                    creditLimit: data.creditLimit || 0,
                    creditDays: data.creditDays || 0,
                },
            });
        };
        CompaniesService_1.prototype.getClientDetail = function (clientId) {
            return this.prisma.client.findUnique({
                where: { id: clientId },
                include: {
                    ordenesCompra: {
                        include: {
                            lineas: { include: { product: true } },
                            surtidos: true,
                        },
                        orderBy: { fecha: 'desc' },
                    },
                    receivables: {
                        where: { status: { in: ['PENDIENTE', 'PARCIAL', 'VENCIDO'] } },
                        orderBy: { date: 'desc' },
                    },
                },
            });
        };
        CompaniesService_1.prototype.createOrdenCompra = function (companyId, clientId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var montoTotal;
                return __generator(this, function (_a) {
                    montoTotal = data.lineas
                        ? data.lineas.reduce(function (t, l) { return t + (l.cantidad * l.precioUnitario); }, 0)
                        : Number(data.montoTotal || 0);
                    return [2 /*return*/, this.prisma.ordenCompra.create({
                            data: {
                                companyId: companyId,
                                clientId: clientId,
                                numero: data.numero,
                                fecha: new Date(data.fecha),
                                montoTotal: montoTotal,
                                saldo: montoTotal,
                                status: 'PENDIENTE',
                                notes: data.notes || null,
                                lineas: data.lineas ? {
                                    create: data.lineas.map(function (l) { return ({
                                        productId: l.productId,
                                        cantidad: l.cantidad,
                                        precioUnitario: l.precioUnitario,
                                        total: l.cantidad * l.precioUnitario,
                                    }); }),
                                } : undefined,
                            },
                            include: { lineas: { include: { product: true } } },
                        })];
                });
            });
        };
        CompaniesService_1.prototype.registrarSurtido = function (ordenId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var orden, montoSurtido, _loop_1, this_1, _i, _a, ls, nuevoMontoSurtido, nuevoSaldo, nuevoStatus;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.ordenCompra.findUnique({
                                where: { id: ordenId },
                                include: { lineas: true },
                            })];
                        case 1:
                            orden = _b.sent();
                            if (!orden)
                                throw new Error('OC no encontrada');
                            if (orden.status === 'CANCELADA')
                                throw new Error('No se puede surtir una OC cancelada');
                            montoSurtido = 0;
                            if (!(data.lineas && data.lineas.length > 0)) return [3 /*break*/, 6];
                            _loop_1 = function (ls) {
                                var linea, nuevaCantSurtida;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            linea = orden.lineas.find(function (l) { return l.id === ls.lineaId; });
                                            if (!linea)
                                                return [2 /*return*/, "continue"];
                                            nuevaCantSurtida = Number(linea.cantidadSurtida) + Number(ls.cantidad);
                                            return [4 /*yield*/, this_1.prisma.lineaOC.update({
                                                    where: { id: ls.lineaId },
                                                    data: { cantidadSurtida: nuevaCantSurtida },
                                                })];
                                        case 1:
                                            _c.sent();
                                            montoSurtido += Number(ls.cantidad) * Number(linea.precioUnitario);
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            this_1 = this;
                            _i = 0, _a = data.lineas;
                            _b.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                            ls = _a[_i];
                            return [5 /*yield**/, _loop_1(ls)];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5: return [3 /*break*/, 7];
                        case 6:
                            montoSurtido = Number(data.monto || 0);
                            _b.label = 7;
                        case 7:
                            nuevoMontoSurtido = Number(orden.montoSurtido) + montoSurtido;
                            nuevoSaldo = Number(orden.montoTotal) - nuevoMontoSurtido;
                            nuevoStatus = nuevoSaldo <= 0 ? 'SURTIDO_COMPLETO' : 'SURTIDO_PARCIAL';
                            return [2 /*return*/, this.prisma.$transaction([
                                    this.prisma.surtidoOC.create({
                                        data: {
                                            ordenCompraId: ordenId,
                                            fecha: new Date(data.fecha),
                                            monto: montoSurtido,
                                            notes: data.notes || null,
                                        },
                                    }),
                                    this.prisma.ordenCompra.update({
                                        where: { id: ordenId },
                                        data: { montoSurtido: nuevoMontoSurtido, saldo: nuevoSaldo, status: nuevoStatus },
                                    }),
                                ])];
                    }
                });
            });
        };
        CompaniesService_1.prototype.cancelarOC = function (ordenId, motivo) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.ordenCompra.update({
                            where: { id: ordenId },
                            data: { status: 'CANCELADA', notes: motivo },
                        })];
                });
            });
        };
        CompaniesService_1.prototype.cerrarOCParcial = function (ordenId) {
            return __awaiter(this, void 0, void 0, function () {
                var orden;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.ordenCompra.findUnique({ where: { id: ordenId } })];
                        case 1:
                            orden = _a.sent();
                            if (!orden)
                                throw new Error('OC no encontrada');
                            return [2 /*return*/, this.prisma.ordenCompra.update({
                                    where: { id: ordenId },
                                    data: { status: 'SURTIDO_COMPLETO' },
                                })];
                    }
                });
            });
        };
        return CompaniesService_1;
    }());
    __setFunctionName(_classThis, "CompaniesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CompaniesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CompaniesService = _classThis;
}();
exports.CompaniesService = CompaniesService;
