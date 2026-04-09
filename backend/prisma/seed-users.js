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
var bcrypt = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var machete, worka, palestra, lonche, roles, roleList, _i, roleList_1, r, _a, _b, _c, _d, todasEmpresas, usuarios, _e, usuarios_1, u, passwordHash, user, role, _f, _g, empresa;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    console.log('👥 Creando usuarios...');
                    return [4 /*yield*/, prisma.company.findUnique({ where: { code: 'MACHETE' } })];
                case 1:
                    machete = _h.sent();
                    return [4 /*yield*/, prisma.company.findUnique({ where: { code: 'WORKA' } })];
                case 2:
                    worka = _h.sent();
                    return [4 /*yield*/, prisma.company.findUnique({ where: { code: 'PALESTRA' } })];
                case 3:
                    palestra = _h.sent();
                    return [4 /*yield*/, prisma.company.findUnique({ where: { code: 'LONCHE' } })];
                case 4:
                    lonche = _h.sent();
                    if (!machete || !worka || !palestra || !lonche) {
                        throw new Error('Empresas no encontradas. Ejecuta el seed principal primero.');
                    }
                    roles = {};
                    return [4 /*yield*/, prisma.role.findMany()];
                case 5:
                    roleList = _h.sent();
                    for (_i = 0, roleList_1 = roleList; _i < roleList_1.length; _i++) {
                        r = roleList_1[_i];
                        roles[r.code] = r;
                    }
                    if (!!roles['director']) return [3 /*break*/, 7];
                    _a = roles;
                    _b = 'director';
                    return [4 /*yield*/, prisma.role.upsert({
                            where: { code: 'director' },
                            update: {},
                            create: { code: 'director', name: 'Director General', description: 'Solo lectura, acceso a todo' },
                        })];
                case 6:
                    _a[_b] = _h.sent();
                    console.log('✅ Rol director creado');
                    _h.label = 7;
                case 7:
                    if (!!roles['administrador']) return [3 /*break*/, 9];
                    _c = roles;
                    _d = 'administrador';
                    return [4 /*yield*/, prisma.role.upsert({
                            where: { code: 'administrador' },
                            update: {},
                            create: { code: 'administrador', name: 'Administrador', description: 'Acceso total' },
                        })];
                case 8:
                    _c[_d] = _h.sent();
                    console.log('✅ Rol administrador creado');
                    _h.label = 9;
                case 9:
                    todasEmpresas = [machete, worka, palestra, lonche];
                    usuarios = [
                        {
                            name: 'Carolina Moreno',
                            email: 'carolina@grupoworkaholic.com',
                            password: 'supworka2026@',
                            empresas: todasEmpresas,
                            rol: 'gerente',
                        },
                        {
                            name: 'Julia Alvarado',
                            email: 'julia@grupoworkaholic.com',
                            password: 'userpalestra2026@',
                            empresas: [palestra],
                            rol: 'contador',
                        },
                        {
                            name: 'Kasandra Leon',
                            email: 'kasandra@grupoworkaholic.com',
                            password: 'userworka2026@',
                            empresas: [worka],
                            rol: 'contador',
                        },
                        {
                            name: 'Jaen Plaza',
                            email: 'jaen@grupoworkaholic.com',
                            password: 'userlonche2026@',
                            empresas: [lonche, palestra],
                            rol: 'contador',
                        },
                        {
                            name: 'Wendy Diaz',
                            email: 'wendy@grupoworkaholic.com',
                            password: 'usermachete2026@',
                            empresas: [machete],
                            rol: 'contador',
                        },
                        {
                            name: 'Lucia',
                            email: 'lucia@grupoworkaholic.com',
                            password: 'cajama26@',
                            empresas: [machete],
                            rol: 'cajero',
                        },
                        {
                            name: 'Mayte',
                            email: 'mayte@grupoworkaholic.com',
                            password: 'rhall26@',
                            empresas: todasEmpresas,
                            rol: 'rh',
                        },
                        {
                            name: 'Jesus',
                            email: 'jesus@grupoworkaholic.com',
                            password: 'rhall27@',
                            empresas: todasEmpresas,
                            rol: 'rh',
                        },
                        {
                            name: 'Gerardo',
                            email: 'gerardo@grupoworkaholic.com',
                            password: 'rhall28@',
                            empresas: todasEmpresas,
                            rol: 'rh',
                        },
                        {
                            name: 'Miguel de Leon',
                            email: 'miguel@iconos.mx',
                            password: 'boos26@',
                            empresas: todasEmpresas,
                            rol: 'director',
                        },
                        {
                            name: 'Miguel Lora',
                            email: 'loraloraangel@gmail.com',
                            password: 'admin2026@',
                            empresas: todasEmpresas,
                            rol: 'administrador',
                        },
                    ];
                    _e = 0, usuarios_1 = usuarios;
                    _h.label = 10;
                case 10:
                    if (!(_e < usuarios_1.length)) return [3 /*break*/, 18];
                    u = usuarios_1[_e];
                    return [4 /*yield*/, bcrypt.hash(u.password, 10)];
                case 11:
                    passwordHash = _h.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: u.email },
                            update: { passwordHash: passwordHash, name: u.name },
                            create: { email: u.email, name: u.name, passwordHash: passwordHash, isActive: true },
                        })];
                case 12:
                    user = _h.sent();
                    role = roles[u.rol];
                    if (!role) {
                        console.log("\u26A0 Rol ".concat(u.rol, " no encontrado para ").concat(u.name));
                        return [3 /*break*/, 17];
                    }
                    _f = 0, _g = u.empresas;
                    _h.label = 13;
                case 13:
                    if (!(_f < _g.length)) return [3 /*break*/, 16];
                    empresa = _g[_f];
                    if (!empresa)
                        return [3 /*break*/, 15];
                    return [4 /*yield*/, prisma.userCompanyRole.upsert({
                            where: { userId_companyId: { userId: user.id, companyId: empresa.id } },
                            update: { roleId: role.id },
                            create: { userId: user.id, companyId: empresa.id, roleId: role.id },
                        })];
                case 14:
                    _h.sent();
                    _h.label = 15;
                case 15:
                    _f++;
                    return [3 /*break*/, 13];
                case 16:
                    console.log("\u2705 ".concat(u.name, " \u2014 ").concat(u.rol, " \u2014 ").concat(u.empresas.map(function (e) { return e.code; }).join(', ')));
                    _h.label = 17;
                case 17:
                    _e++;
                    return [3 /*break*/, 10];
                case 18:
                    console.log('\n🎉 Todos los usuarios creados!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error('❌ Error:', e); process.exit(1); })
    .finally(function () { return prisma.$disconnect(); });
