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
exports.PayrollService = void 0;
var common_1 = require("@nestjs/common");
var PayrollService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var PayrollService = _classThis = /** @class */ (function () {
        function PayrollService_1(prisma) {
            this.prisma = prisma;
        }
        PayrollService_1.prototype.getPeriods = function (companyId) {
            return this.prisma.payrollPeriod.findMany({
                where: { companyId: companyId },
                orderBy: { period: 'desc' },
            });
        };
        PayrollService_1.prototype.createPeriod = function (companyId, data) {
            return this.prisma.payrollPeriod.create({
                data: __assign(__assign({ companyId: companyId }, data), { status: 'ABIERTO' }),
            });
        };
        PayrollService_1.prototype.loadEmployees = function (periodId) {
            return __awaiter(this, void 0, void 0, function () {
                var period, employees, loaded, _i, employees_1, emp, existing, baseSalary, imssEmployee, isrRetention, totalPerceptions, totalDeductions, netPay;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.payrollPeriod.findUnique({ where: { id: periodId } })];
                        case 1:
                            period = _a.sent();
                            if (!period)
                                throw new Error('Período no encontrado');
                            return [4 /*yield*/, this.prisma.employee.findMany({
                                    where: { companyId: period.companyId, status: 'ACTIVO' },
                                })];
                        case 2:
                            employees = _a.sent();
                            loaded = 0;
                            _i = 0, employees_1 = employees;
                            _a.label = 3;
                        case 3:
                            if (!(_i < employees_1.length)) return [3 /*break*/, 7];
                            emp = employees_1[_i];
                            return [4 /*yield*/, this.prisma.payrollLine.findUnique({
                                    where: { payrollPeriodId_employeeId: { payrollPeriodId: periodId, employeeId: emp.id } },
                                })];
                        case 4:
                            existing = _a.sent();
                            if (existing)
                                return [3 /*break*/, 6];
                            baseSalary = period.type === 'QUINCENAL'
                                ? Number(emp.grossSalary) / 2
                                : Number(emp.grossSalary);
                            imssEmployee = baseSalary * 0.0204;
                            isrRetention = baseSalary * 0.08;
                            totalPerceptions = baseSalary;
                            totalDeductions = imssEmployee + isrRetention;
                            netPay = totalPerceptions - totalDeductions;
                            return [4 /*yield*/, this.prisma.payrollLine.create({
                                    data: {
                                        payrollPeriodId: periodId,
                                        employeeId: emp.id,
                                        companyId: period.companyId,
                                        baseSalary: baseSalary,
                                        totalPerceptions: totalPerceptions,
                                        imssEmployee: imssEmployee,
                                        isrRetention: isrRetention,
                                        totalDeductions: totalDeductions,
                                        netPay: netPay,
                                        imssEmployer: baseSalary * 0.0704,
                                    },
                                })];
                        case 5:
                            _a.sent();
                            loaded++;
                            _a.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 3];
                        case 7: return [2 /*return*/, { loaded: loaded, total: employees.length }];
                    }
                });
            });
        };
        PayrollService_1.prototype.getLines = function (periodId) {
            return this.prisma.payrollLine.findMany({
                where: { payrollPeriodId: periodId },
                include: { employee: { select: { id: true, firstName: true, lastName: true, position: true, employeeNumber: true, bankAccount: true } } },
                orderBy: { employee: { lastName: 'asc' } },
            });
        };
        PayrollService_1.prototype.updateLine = function (lineId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var line, overtime, bonus, infonavit, loans, totalPerceptions, isrRetention, totalDeductions, netPay;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, this.prisma.payrollLine.findUnique({ where: { id: lineId } })];
                        case 1:
                            line = _e.sent();
                            if (!line)
                                throw new Error('Línea no encontrada');
                            overtime = (_a = data.overtime) !== null && _a !== void 0 ? _a : Number(line.overtime || 0);
                            bonus = (_b = data.bonus) !== null && _b !== void 0 ? _b : Number(line.bonus || 0);
                            infonavit = (_c = data.infonavit) !== null && _c !== void 0 ? _c : Number(line.infonavit || 0);
                            loans = (_d = data.loans) !== null && _d !== void 0 ? _d : Number(line.loans || 0);
                            totalPerceptions = Number(line.baseSalary) + overtime + bonus;
                            isrRetention = totalPerceptions * 0.08;
                            totalDeductions = Number(line.imssEmployee) + isrRetention + infonavit + loans;
                            netPay = totalPerceptions - totalDeductions;
                            return [2 /*return*/, this.prisma.payrollLine.update({
                                    where: { id: lineId },
                                    data: { overtime: overtime, bonus: bonus, infonavit: infonavit, loans: loans, totalPerceptions: totalPerceptions, isrRetention: isrRetention, totalDeductions: totalDeductions, netPay: netPay },
                                })];
                    }
                });
            });
        };
        PayrollService_1.prototype.exportToContpaq = function (periodId) {
            return __awaiter(this, void 0, void 0, function () {
                var period, rows, _i, _a, line, emp, name_1, rfc, num, totalNet;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.prisma.payrollPeriod.findUnique({
                                where: { id: periodId },
                                include: { lines: { include: { employee: true } } },
                            })];
                        case 1:
                            period = _b.sent();
                            if (!period)
                                throw new Error('Período no encontrado');
                            rows = ['RFC,Nombre,NumEmpleado,Concepto,TipoConcepto,Importe'];
                            for (_i = 0, _a = period.lines; _i < _a.length; _i++) {
                                line = _a[_i];
                                emp = line.employee;
                                name_1 = "".concat(emp.lastName, " ").concat(emp.firstName).trim();
                                rfc = emp.rfc || '';
                                num = emp.employeeNumber || '';
                                if (Number(line.baseSalary) > 0)
                                    rows.push("".concat(rfc, ",").concat(name_1, ",").concat(num, ",001,P,").concat(Number(line.baseSalary).toFixed(2)));
                                if (Number(line.isrRetention) > 0)
                                    rows.push("".concat(rfc, ",").concat(name_1, ",").concat(num, ",080,D,").concat(Number(line.isrRetention).toFixed(2)));
                                if (Number(line.imssEmployee) > 0)
                                    rows.push("".concat(rfc, ",").concat(name_1, ",").concat(num, ",082,D,").concat(Number(line.imssEmployee).toFixed(2)));
                            }
                            totalNet = period.lines.reduce(function (t, l) { return t + Number(l.netPay); }, 0);
                            return [4 /*yield*/, this.prisma.payrollPeriod.update({ where: { id: periodId }, data: { status: 'EXPORTADO', exportedAt: new Date(), totalNet: totalNet } })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, {
                                    csv: rows.join('\n'),
                                    fileName: "nomina_".concat(period.periodLabel, ".csv"),
                                    recordCount: period.lines.length,
                                    totalNet: totalNet,
                                }];
                    }
                });
            });
        };
        PayrollService_1.prototype.registerPayment = function (periodId, cashAccountId, userId) {
            return __awaiter(this, void 0, void 0, function () {
                var period, totalNet, branch, flow;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.payrollPeriod.findUnique({
                                where: { id: periodId },
                                include: { lines: true },
                            })];
                        case 1:
                            period = _a.sent();
                            if (!period)
                                throw new Error('Período no encontrado');
                            totalNet = period.lines.reduce(function (t, l) { return t + Number(l.netPay); }, 0);
                            return [4 /*yield*/, this.prisma.branch.findFirst({ where: { company: { id: period.companyId } } })];
                        case 2:
                            branch = _a.sent();
                            return [4 /*yield*/, this.prisma.flowMovement.create({
                                    data: {
                                        companyId: period.companyId,
                                        branchId: branch.id,
                                        cashAccountId: cashAccountId,
                                        date: new Date(),
                                        type: 'SALIDA',
                                        originType: 'GASTO',
                                        originId: periodId,
                                        amount: totalNet,
                                        currency: 'MXN',
                                        exchangeRate: 1,
                                        amountMxn: totalNet,
                                        notes: "Pago n\u00F3mina: ".concat(period.periodLabel),
                                    },
                                })];
                        case 3:
                            flow = _a.sent();
                            return [4 /*yield*/, this.prisma.payrollPeriod.update({
                                    where: { id: periodId },
                                    data: { status: 'PAGADO', paidAt: new Date(), paidById: userId, flowMovementId: flow.id },
                                })];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, { flowMovementId: flow.id, totalNet: totalNet, periodLabel: period.periodLabel }];
                    }
                });
            });
        };
        return PayrollService_1;
    }());
    __setFunctionName(_classThis, "PayrollService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PayrollService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PayrollService = _classThis;
}();
exports.PayrollService = PayrollService;
