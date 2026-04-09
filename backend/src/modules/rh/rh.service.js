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
exports.RhService = void 0;
var common_1 = require("@nestjs/common");
var RhService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var RhService = _classThis = /** @class */ (function () {
        function RhService_1(prisma) {
            this.prisma = prisma;
        }
        RhService_1.prototype.getDashboard = function (companyId) {
            return Promise.all([
                this.prisma.employee.count({ where: { companyId: companyId } }),
                this.prisma.employee.count({ where: { companyId: companyId, status: 'ACTIVO' } }),
                this.prisma.vacationRequest.count({ where: { companyId: companyId, status: 'PENDIENTE' } }),
            ]).then(function (_a) {
                var total = _a[0], active = _a[1], pendingVacations = _a[2];
                return ({
                    totalEmployees: total,
                    activeEmployees: active,
                    onLeave: 0,
                    pendingVacations: pendingVacations,
                    expiringContracts: [],
                });
            });
        };
        RhService_1.prototype.findAllEmployees = function (companyId, filters) {
            var where = { companyId: companyId };
            if (filters.status)
                where.status = filters.status;
            if (filters.search) {
                where.OR = [
                    { firstName: { contains: filters.search, mode: 'insensitive' } },
                    { lastName: { contains: filters.search, mode: 'insensitive' } },
                    { position: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            return this.prisma.employee.findMany({
                where: where,
                include: { branch: { select: { id: true, name: true } } },
                orderBy: [{ status: 'asc' }, { lastName: 'asc' }],
            });
        };
        RhService_1.prototype.findOneEmployee = function (id) {
            return this.prisma.employee.findUnique({
                where: { id: id },
                include: {
                    branch: true,
                    documents: { orderBy: { createdAt: 'desc' } },
                    vacations: { orderBy: { startDate: 'desc' } },
                    hrEvents: { orderBy: { date: 'desc' } },
                },
            });
        };
        RhService_1.prototype.createEmployee = function (companyId, data) {
            return __awaiter(this, void 0, void 0, function () {
                var count, company, prefix, employeeNumber;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.employee.count({ where: { companyId: companyId } })];
                        case 1:
                            count = _a.sent();
                            return [4 /*yield*/, this.prisma.company.findUnique({ where: { id: companyId } })];
                        case 2:
                            company = _a.sent();
                            prefix = (company === null || company === void 0 ? void 0 : company.code.toUpperCase().slice(0, 3)) || 'EMP';
                            employeeNumber = "".concat(prefix, "-").concat(String(count + 1).padStart(4, '0'));
                            return [2 /*return*/, this.prisma.employee.create({
                                    data: {
                                        companyId: companyId,
                                        employeeNumber: employeeNumber,
                                        firstName: data.firstName,
                                        lastName: data.lastName,
                                        secondLastName: data.secondLastName || null,
                                        rfc: data.rfc || null,
                                        curp: data.curp || null,
                                        nss: data.nss || null,
                                        phone: data.phone || null,
                                        email: data.email || null,
                                        position: data.position,
                                        department: data.department || null,
                                        startDate: new Date(data.startDate),
                                        contractType: data.contractType || 'INDEFINIDO',
                                        salaryType: data.salaryType || 'MENSUAL',
                                        grossSalary: data.grossSalary || 0,
                                        dailySalary: data.dailySalary || data.grossSalary / 30,
                                        bankAccount: data.bankAccount || null,
                                        bankName: data.bankName || null,
                                        status: 'ACTIVO',
                                    },
                                })];
                    }
                });
            });
        };
        RhService_1.prototype.getDocuments = function (employeeId) {
            return this.prisma.employeeDocument.findMany({
                where: { employeeId: employeeId },
                orderBy: { createdAt: 'desc' },
            });
        };
        RhService_1.prototype.addDocument = function (companyId, employeeId, userId, data) {
            return this.prisma.employeeDocument.create({
                data: {
                    companyId: companyId,
                    employeeId: employeeId,
                    uploadedById: userId,
                    type: data.type,
                    title: data.title,
                    fileUrl: data.fileUrl || null,
                    fileName: data.fileName || null,
                    startDate: data.startDate ? new Date(data.startDate) : null,
                    endDate: data.endDate ? new Date(data.endDate) : null,
                    signedAt: data.signedAt ? new Date(data.signedAt) : null,
                    notes: data.notes || null,
                    status: 'VIGENTE',
                },
            });
        };
        RhService_1.prototype.getMissingDocuments = function (employeeId) {
            var required = ['INE', 'CURP', 'NSS', 'RFC', 'CONTRATO', 'ALTA_IMSS'];
            return this.prisma.employeeDocument.findMany({
                where: { employeeId: employeeId, status: 'VIGENTE' },
                select: { type: true },
            }).then(function (existing) {
                var types = existing.map(function (d) { return d.type; });
                return required.filter(function (t) { return !types.includes(t); });
            });
        };
        RhService_1.prototype.getVacationBalance = function (employeeId) {
            return __awaiter(this, void 0, void 0, function () {
                var emp, years, entitled, used, usedDays;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.employee.findUnique({ where: { id: employeeId } })];
                        case 1:
                            emp = _a.sent();
                            if (!emp)
                                return [2 /*return*/, { years: 0, entitled: 0, used: 0, balance: 0 }];
                            years = Math.floor((Date.now() - new Date(emp.startDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                            entitled = years <= 0 ? 0 : years === 1 ? 12 : years === 2 ? 14 : years <= 4 ? 16 : 20;
                            return [4 /*yield*/, this.prisma.vacationRequest.aggregate({
                                    where: { employeeId: employeeId, status: 'APROBADO', type: 'VACACIONES' },
                                    _sum: { days: true },
                                })];
                        case 2:
                            used = _a.sent();
                            usedDays = used._sum.days || 0;
                            return [2 /*return*/, { years: years, entitled: entitled, used: usedDays, balance: entitled - usedDays }];
                    }
                });
            });
        };
        RhService_1.prototype.requestVacation = function (companyId, employeeId, data) {
            var start = new Date(data.startDate);
            var end = new Date(data.endDate);
            var days = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
            return this.prisma.vacationRequest.create({
                data: { companyId: companyId, employeeId: employeeId, startDate: start, endDate: end, days: days, type: data.type || 'VACACIONES', status: 'PENDIENTE' },
            });
        };
        RhService_1.prototype.approveVacation = function (id, userId, approved) {
            return this.prisma.vacationRequest.update({
                where: { id: id },
                data: { status: approved ? 'APROBADO' : 'RECHAZADO', approvedById: userId, approvedAt: new Date() },
            });
        };
        RhService_1.prototype.getEvents = function (employeeId) {
            return this.prisma.hREvent.findMany({ where: { employeeId: employeeId }, orderBy: { date: 'desc' } });
        };
        RhService_1.prototype.createEvent = function (companyId, employeeId, userId, data) {
            return this.prisma.hREvent.create({
                data: { companyId: companyId, employeeId: employeeId, createdById: userId, type: data.type, date: new Date(data.date), description: data.description, resolution: data.resolution || null },
            });
        };
        RhService_1.prototype.getHRConfig = function (companyId) {
            return this.prisma.companyHRConfig.findUnique({ where: { companyId: companyId } });
        };
        RhService_1.prototype.upsertHRConfig = function (companyId, data) {
            return this.prisma.companyHRConfig.upsert({
                where: { companyId: companyId },
                update: data,
                create: __assign({ companyId: companyId }, data),
            });
        };
        return RhService_1;
    }());
    __setFunctionName(_classThis, "RhService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        RhService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return RhService = _classThis;
}();
exports.RhService = RhService;
