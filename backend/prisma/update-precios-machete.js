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
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var machete, precios, _i, precios_1, p, prod, nuevos, _a, nuevos_1, p, exists, pres, prod;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('💰 Actualizando precios y productos Machete...');
                    return [4 /*yield*/, prisma.company.findUnique({ where: { code: 'MACHETE' } })];
                case 1:
                    machete = _b.sent();
                    if (!machete)
                        throw new Error('Empresa MACHETE no encontrada');
                    precios = [
                        // Línea Machete
                        { sku: 'MCH-30G-N', tienda: 75, mayoreo: 59, distribuidor: 52, online: 79 },
                        { sku: 'MCH-30G-P', tienda: 75, mayoreo: 59, distribuidor: 52, online: 79 },
                        { sku: 'MCH-60G-N', tienda: 135, mayoreo: 115, distribuidor: 95, online: 142 },
                        { sku: 'MCH-60G-P', tienda: 135, mayoreo: 115, distribuidor: 95, online: 142 },
                        { sku: 'MCH-120G-N', tienda: 260, mayoreo: 199, distribuidor: 185, online: 273 },
                        { sku: 'MCH-120G-P', tienda: 199, mayoreo: 185, distribuidor: 185, online: 209 },
                        // Línea Económica Chicali
                        { sku: 'CHI-25G-N', tienda: 60, mayoreo: 50, distribuidor: 40, online: 63 },
                        { sku: 'MAC-90G', tienda: 100, mayoreo: 80, distribuidor: 70, online: 105 },
                        // Kilos — solo tienda, distribuidor y mayoreo en 0
                        { sku: 'MAC-500G', tienda: 550, mayoreo: 0, distribuidor: 0, online: 0 },
                        { sku: 'MAC-1KG', tienda: 950, mayoreo: 0, distribuidor: 0, online: 0 },
                        { sku: 'CHI-500G-N', tienda: 800, mayoreo: 0, distribuidor: 0, online: 0 },
                        { sku: 'CHI-900G-N', tienda: 1500, mayoreo: 0, distribuidor: 0, online: 0 },
                        { sku: 'CHI-900G-P', tienda: 1500, mayoreo: 0, distribuidor: 0, online: 0 },
                    ];
                    _i = 0, precios_1 = precios;
                    _b.label = 2;
                case 2:
                    if (!(_i < precios_1.length)) return [3 /*break*/, 6];
                    p = precios_1[_i];
                    return [4 /*yield*/, prisma.product.findUnique({
                            where: { companyId_sku: { companyId: machete.id, sku: p.sku } },
                        })];
                case 3:
                    prod = _b.sent();
                    if (!prod) {
                        console.log("\u26A0 No encontrado: ".concat(p.sku));
                        return [3 /*break*/, 5];
                    }
                    return [4 /*yield*/, prisma.product.update({
                            where: { id: prod.id },
                            data: {
                                priceMostrador: p.tienda,
                                priceMayoreo: p.mayoreo,
                                priceOnline: p.distribuidor,
                                priceML: p.online,
                            },
                        })];
                case 4:
                    _b.sent();
                    console.log("\u2705 ".concat(p.sku));
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6:
                    nuevos = [
                        // Chicali 60g Picante (línea económica)
                        { sku: 'CHI-60G-P', name: 'Carne seca Chicali 60g Picante', grams: 60, type: 'RES', flavor: 'CHI', tienda: 110, mayoreo: 95, distribuidor: 85, online: 116, stock: 0 },
                        // Chicali 1kg Natural (usar CHI-900G-N ya existe como 900g, este es 1kg diferente)
                        { sku: 'CHI-1KG-N', name: 'Carne seca Chicali 1kg Natural', grams: 1000, type: 'RES', flavor: 'NAT', tienda: 1500, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
                        // Cerdo en desarrollo
                        { sku: 'CER-30G-N', name: 'Carne seca Cerdo 30g Natural', grams: 30, type: 'CER', flavor: 'NAT', tienda: 0, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
                        { sku: 'CER-30G-P', name: 'Carne seca Cerdo 30g Picante', grams: 30, type: 'CER', flavor: 'CHI', tienda: 0, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
                        { sku: 'CER-60G-N', name: 'Carne seca Cerdo 60g Natural', grams: 60, type: 'CER', flavor: 'NAT', tienda: 0, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
                        // CER-60G-P ya existe
                    ];
                    _a = 0, nuevos_1 = nuevos;
                    _b.label = 7;
                case 7:
                    if (!(_a < nuevos_1.length)) return [3 /*break*/, 14];
                    p = nuevos_1[_a];
                    return [4 /*yield*/, prisma.product.findUnique({
                            where: { companyId_sku: { companyId: machete.id, sku: p.sku } },
                        })];
                case 8:
                    exists = _b.sent();
                    if (!exists) return [3 /*break*/, 10];
                    return [4 /*yield*/, prisma.product.update({
                            where: { id: exists.id },
                            data: { priceMostrador: p.tienda, priceMayoreo: p.mayoreo, priceOnline: p.distribuidor, priceML: p.online },
                        })];
                case 9:
                    _b.sent();
                    console.log("\u2705 ".concat(p.sku, " actualizado"));
                    return [3 /*break*/, 13];
                case 10:
                    pres = p.grams <= 30 ? '30G' : p.grams <= 60 ? '60G' : p.grams <= 120 ? '120G' : p.grams <= 500 ? '500G' : '1KG';
                    return [4 /*yield*/, prisma.product.create({
                            data: {
                                companyId: machete.id,
                                sku: p.sku, name: p.name,
                                meatType: p.type, flavor: p.flavor,
                                gramsWeight: p.grams, presentation: pres,
                                priceMostrador: p.tienda, priceMayoreo: p.mayoreo,
                                priceOnline: p.distribuidor, priceML: p.online,
                                isActive: p.tienda > 0, // inactivo si no tiene precio aún
                            },
                        })];
                case 11:
                    prod = _b.sent();
                    return [4 /*yield*/, prisma.productStock.create({
                            data: { productId: prod.id, stock: p.stock, minStock: 5 },
                        })];
                case 12:
                    _b.sent();
                    console.log("\u2705 ".concat(p.sku, " creado").concat(p.tienda === 0 ? ' (en desarrollo)' : ''));
                    _b.label = 13;
                case 13:
                    _a++;
                    return [3 /*break*/, 7];
                case 14:
                    console.log('\n🎉 Catálogo Machete actualizado!');
                    console.log('💡 Productos de cerdo marcados como inactivos hasta tener precios');
                    console.log('💡 Kilos sin precio online ni distribuidor — modifica desde Catálogo');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) { console.error('❌ Error:', e); process.exit(1); })
    .finally(function () { return prisma.$disconnect(); });
