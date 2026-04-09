"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var machete, worka, palestra, lonche, companies, _i, companies_1, c, adminRole, passwordHash, admin, _a, companies_2, c, _b, companies_3, c;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🌱 Iniciando seed...');
                    return [4 /*yield*/, prisma.company.upsert({ where: { code: 'MACHETE' }, update: {}, create: { code: 'MACHETE', name: 'Manjares Machete', color: '#B5451B', hasProduction: true, isActive: true } })];
                case 1:
                    machete = _c.sent();
                    return [4 /*yield*/, prisma.company.upsert({ where: { code: 'WORKA' }, update: {}, create: { code: 'WORKA', name: 'Workaholic', color: '#3b82f6', isActive: true } })];
                case 2:
                    worka = _c.sent();
                    return [4 /*yield*/, prisma.company.upsert({ where: { code: 'PALESTRA' }, update: {}, create: { code: 'PALESTRA', name: 'Palestra', color: '#10b981', isActive: true } })];
                case 3:
                    palestra = _c.sent();
                    return [4 /*yield*/, prisma.company.upsert({ where: { code: 'LONCHE' }, update: {}, create: { code: 'LONCHE', name: 'Lonche', color: '#f59e0b', isActive: true } })];
                case 4:
                    lonche = _c.sent();
                    companies = [machete, worka, palestra, lonche];
                    console.log('✅ Empresas:', companies.map(function (c) { return c.name; }).join(', '));
                    _i = 0, companies_1 = companies;
                    _c.label = 5;
                case 5:
                    if (!(_i < companies_1.length)) return [3 /*break*/, 8];
                    c = companies_1[_i];
                    return [4 /*yield*/, prisma.branch.upsert({
                            where: { companyId_code: { companyId: c.id, code: 'MAIN' } },
                            update: {},
                            create: { companyId: c.id, code: 'MAIN', name: "".concat(c.name, " Principal"), isActive: true },
                        })];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    console.log('✅ Sucursales creadas');
                    return [4 /*yield*/, prisma.role.upsert({ where: { code: 'admin' }, update: {}, create: { code: 'admin', name: 'Administrador', description: 'Acceso total' } })];
                case 9:
                    adminRole = _c.sent();
                    return [4 /*yield*/, prisma.role.upsert({ where: { code: 'gerente' }, update: {}, create: { code: 'gerente', name: 'Gerente', description: 'Gerencia' } })];
                case 10:
                    _c.sent();
                    return [4 /*yield*/, prisma.role.upsert({ where: { code: 'contador' }, update: {}, create: { code: 'contador', name: 'Contador', description: 'Contabilidad' } })];
                case 11:
                    _c.sent();
                    return [4 /*yield*/, prisma.role.upsert({ where: { code: 'rh' }, update: {}, create: { code: 'rh', name: 'Recursos Humanos', description: 'RH' } })];
                case 12:
                    _c.sent();
                    return [4 /*yield*/, prisma.role.upsert({ where: { code: 'cajero' }, update: {}, create: { code: 'cajero', name: 'Cajero', description: 'Caja' } })];
                case 13:
                    _c.sent();
                    console.log('✅ Roles creados');
                    return [4 /*yield*/, bcrypt.hash('Admin2026!', 10)];
                case 14:
                    passwordHash = _c.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@grupoworkaholic.com' },
                            update: {},
                            create: { email: 'admin@grupoworkaholic.com', name: 'Administrador GW', passwordHash: passwordHash, isActive: true },
                        })];
                case 15:
                    admin = _c.sent();
                    console.log('✅ Usuario admin:', admin.email);
                    _a = 0, companies_2 = companies;
                    _c.label = 16;
                case 16:
                    if (!(_a < companies_2.length)) return [3 /*break*/, 19];
                    c = companies_2[_a];
                    return [4 /*yield*/, prisma.userCompanyRole.upsert({
                            where: { userId_companyId: { userId: admin.id, companyId: c.id } },
                            update: {},
                            create: { userId: admin.id, companyId: c.id, roleId: adminRole.id },
                        })];
                case 17:
                    _c.sent();
                    _c.label = 18;
                case 18:
                    _a++;
                    return [3 /*break*/, 16];
                case 19:
                    console.log('✅ Accesos configurados');
                    _b = 0, companies_3 = companies;
                    _c.label = 20;
                case 20:
                    if (!(_b < companies_3.length)) return [3 /*break*/, 24];
                    c = companies_3[_b];
                    return [4 /*yield*/, prisma.cashAccount.upsert({ where: { companyId_code: { companyId: c.id, code: 'BBVA' } }, update: {}, create: { companyId: c.id, code: 'BBVA', name: 'BBVA Principal', type: 'BANCO', currency: 'MXN', bankName: 'BBVA', isActive: true } })];
                case 21:
                    _c.sent();
                    return [4 /*yield*/, prisma.cashAccount.upsert({ where: { companyId_code: { companyId: c.id, code: 'CAJA' } }, update: {}, create: { companyId: c.id, code: 'CAJA', name: 'Caja chica', type: 'EFECTIVO', currency: 'MXN', isActive: true } })];
                case 22:
                    _c.sent();
                    _c.label = 23;
                case 23:
                    _b++;
                    return [3 /*break*/, 20];
                case 24:
                    console.log('✅ Cuentas bancarias creadas');
                    console.log('\n🎉 Seed completado!');
                    console.log('📧 admin@grupoworkaholic.com');
                    console.log('🔑 Admin2026!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error('❌ Error:', e); process.exit(1); })
    .finally(function () { return prisma.$disconnect(); });
