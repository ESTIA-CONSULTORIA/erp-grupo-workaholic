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
var prisma = new client_1.PrismaClient();
function toCode(str) {
    return str.toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var companies, catalogo, _i, companies_1, company, schema, _a, catalogo_1, sec, section, groupOrder, _b, _c, grp, grpCode, group, rubricOrder, _d, _e, rub, rubCode, exists;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    console.log('📊 Cargando catálogo de cuentas...');
                    return [4 /*yield*/, prisma.company.findMany()];
                case 1:
                    companies = _f.sent();
                    if (!companies.length)
                        throw new Error('No hay empresas');
                    catalogo = [
                        {
                            section: 'GASTOS_GENERALES', sectionName: 'Gastos Generales', order: 1,
                            grupos: [
                                { name: 'Trámites / Gestiones', rubrics: ['Alcoholes', 'Multas', 'Permisos', 'Oficina Contador', 'Gestiones'] },
                                { name: 'Renta', rubrics: ['Edificio', 'Estacionamiento'] },
                                { name: 'Aseo y Limpieza', rubrics: ['Art. Limpieza', 'Basura', 'Fumigación', 'Skit Industrial'] },
                                { name: 'Comedor de Empleados', rubrics: ['Comedor', 'Cumpleaños'] },
                                { name: 'Comisiones Bancarias', rubrics: ['Banregio', 'Playtomic', 'Mercado Pago'] },
                                { name: 'Comisiones Ventas / Bonos', rubrics: ['Comisiones ventas', 'Bonos'] },
                                { name: 'Servicios', rubrics: ['CESPM', 'CFE', 'Morvil Paneles'] },
                                { name: 'Mtto Audio Ilum Cómputo', rubrics: ['Audio', 'Iluminación', 'Equipo Cómputo'] },
                                { name: 'Mtto Edificio Mobiliario', rubrics: ['Mantenimiento edificio', 'Herramientas', 'Eq restaurant', 'Eq deportivo', 'Mobiliario club', 'Eq oficina'] },
                                { name: 'Mtto Transporte', rubrics: ['Mantenimiento transporte', 'Gasolina'] },
                                { name: 'Papelería', rubrics: ['Impresora', 'Art Oficina'] },
                                { name: 'Comercial', rubrics: ['Marketing', 'Deterioro M Promocional', 'INDEX'] },
                                { name: 'Gasto Administrativo', rubrics: ['Gasto administrativo general'] },
                                { name: 'Nóminas Operación', rubrics: ['Gerencia', 'Servicio', 'Recepción', 'Club', 'Coach', 'Cocina', 'Barra', 'Finiquitos', 'Vacaciones', 'Prorrateo aguinaldo'] },
                                { name: 'Servicios Digitales', rubrics: ['CRM', 'SoftRestaurant', 'Kaelus', 'Alarma', 'Sky', 'ChatGPT', 'Spotify', 'Joycard', 'Capcut', 'Mem Playtomic', 'R Sis ContPAQ', 'Internet'] },
                                { name: 'Gastos de Operación', rubrics: ['Uniformes', 'Capacitación Personal', 'Gasto evento', 'Gastos evento manteles'] },
                                { name: 'Otros Gastos', rubrics: ['Donación', 'Otros'] },
                            ]
                        },
                        {
                            section: 'CONTRIBUCIONES', sectionName: 'Contribuciones', order: 2,
                            grupos: [
                                { name: 'Contribuciones', rubrics: ['IMSS Patronal', 'Infonavit', 'REPSE', 'Impuestos Federales', 'Impuestos Trimestrales'] }
                            ]
                        }
                    ];
                    _i = 0, companies_1 = companies;
                    _f.label = 2;
                case 2:
                    if (!(_i < companies_1.length)) return [3 /*break*/, 23];
                    company = companies_1[_i];
                    console.log("\n\uD83C\uDFE2 ".concat(company.name));
                    return [4 /*yield*/, prisma.financialSchema.findUnique({ where: { companyId: company.id } })];
                case 3:
                    schema = _f.sent();
                    if (!!schema) return [3 /*break*/, 5];
                    return [4 /*yield*/, prisma.financialSchema.create({
                            data: { companyId: company.id, name: "Esquema ".concat(company.name), isActive: true }
                        })];
                case 4:
                    schema = _f.sent();
                    _f.label = 5;
                case 5:
                    _a = 0, catalogo_1 = catalogo;
                    _f.label = 6;
                case 6:
                    if (!(_a < catalogo_1.length)) return [3 /*break*/, 22];
                    sec = catalogo_1[_a];
                    return [4 /*yield*/, prisma.financialSection.findUnique({
                            where: { schemaId_code: { schemaId: schema.id, code: sec.section } }
                        })];
                case 7:
                    section = _f.sent();
                    if (!!section) return [3 /*break*/, 9];
                    return [4 /*yield*/, prisma.financialSection.create({
                            data: { schemaId: schema.id, code: sec.section, name: sec.sectionName, order: sec.order }
                        })];
                case 8:
                    section = _f.sent();
                    _f.label = 9;
                case 9:
                    groupOrder = 1;
                    _b = 0, _c = sec.grupos;
                    _f.label = 10;
                case 10:
                    if (!(_b < _c.length)) return [3 /*break*/, 21];
                    grp = _c[_b];
                    grpCode = toCode(grp.name);
                    return [4 /*yield*/, prisma.financialGroup.findUnique({
                            where: { sectionId_code: { sectionId: section.id, code: grpCode } }
                        })];
                case 11:
                    group = _f.sent();
                    if (!!group) return [3 /*break*/, 13];
                    return [4 /*yield*/, prisma.financialGroup.create({
                            data: { sectionId: section.id, code: grpCode, name: grp.name, order: groupOrder }
                        })];
                case 12:
                    group = _f.sent();
                    _f.label = 13;
                case 13:
                    groupOrder++;
                    rubricOrder = 1;
                    _d = 0, _e = grp.rubrics;
                    _f.label = 14;
                case 14:
                    if (!(_d < _e.length)) return [3 /*break*/, 19];
                    rub = _e[_d];
                    rubCode = toCode(rub);
                    return [4 /*yield*/, prisma.financialRubric.findUnique({
                            where: { groupId_code: { groupId: group.id, code: rubCode } }
                        })];
                case 15:
                    exists = _f.sent();
                    if (!!exists) return [3 /*break*/, 17];
                    return [4 /*yield*/, prisma.financialRubric.create({
                            data: {
                                groupId: group.id,
                                code: rubCode,
                                name: rub,
                                order: rubricOrder,
                                rubricType: 'GASTO',
                            }
                        })];
                case 16:
                    _f.sent();
                    _f.label = 17;
                case 17:
                    rubricOrder++;
                    _f.label = 18;
                case 18:
                    _d++;
                    return [3 /*break*/, 14];
                case 19:
                    console.log("  \u2705 ".concat(grp.name));
                    _f.label = 20;
                case 20:
                    _b++;
                    return [3 /*break*/, 10];
                case 21:
                    _a++;
                    return [3 /*break*/, 6];
                case 22:
                    _i++;
                    return [3 /*break*/, 2];
                case 23:
                    console.log('\n🎉 Catálogo cargado!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(function () { return prisma.$disconnect(); });
