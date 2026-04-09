"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('💰 Actualizando precios y productos Machete...');
    const machete = await prisma.company.findUnique({ where: { code: 'MACHETE' } });
    if (!machete)
        throw new Error('Empresa MACHETE no encontrada');
    const precios = [
        { sku: 'MCH-30G-N', tienda: 75, mayoreo: 59, distribuidor: 52, online: 79 },
        { sku: 'MCH-30G-P', tienda: 75, mayoreo: 59, distribuidor: 52, online: 79 },
        { sku: 'MCH-60G-N', tienda: 135, mayoreo: 115, distribuidor: 95, online: 142 },
        { sku: 'MCH-60G-P', tienda: 135, mayoreo: 115, distribuidor: 95, online: 142 },
        { sku: 'MCH-120G-N', tienda: 260, mayoreo: 199, distribuidor: 185, online: 273 },
        { sku: 'MCH-120G-P', tienda: 199, mayoreo: 185, distribuidor: 185, online: 209 },
        { sku: 'CHI-25G-N', tienda: 60, mayoreo: 50, distribuidor: 40, online: 63 },
        { sku: 'MAC-90G', tienda: 100, mayoreo: 80, distribuidor: 70, online: 105 },
        { sku: 'MAC-500G', tienda: 550, mayoreo: 0, distribuidor: 0, online: 0 },
        { sku: 'MAC-1KG', tienda: 950, mayoreo: 0, distribuidor: 0, online: 0 },
        { sku: 'CHI-500G-N', tienda: 800, mayoreo: 0, distribuidor: 0, online: 0 },
        { sku: 'CHI-900G-N', tienda: 1500, mayoreo: 0, distribuidor: 0, online: 0 },
        { sku: 'CHI-900G-P', tienda: 1500, mayoreo: 0, distribuidor: 0, online: 0 },
    ];
    for (const p of precios) {
        const prod = await prisma.product.findUnique({
            where: { companyId_sku: { companyId: machete.id, sku: p.sku } },
        });
        if (!prod) {
            console.log(`⚠ No encontrado: ${p.sku}`);
            continue;
        }
        await prisma.product.update({
            where: { id: prod.id },
            data: {
                priceMostrador: p.tienda,
                priceMayoreo: p.mayoreo,
                priceOnline: p.distribuidor,
                priceML: p.online,
            },
        });
        console.log(`✅ ${p.sku}`);
    }
    const nuevos = [
        { sku: 'CHI-60G-P', name: 'Carne seca Chicali 60g Picante', grams: 60, type: 'RES', flavor: 'CHI', tienda: 110, mayoreo: 95, distribuidor: 85, online: 116, stock: 0 },
        { sku: 'CHI-1KG-N', name: 'Carne seca Chicali 1kg Natural', grams: 1000, type: 'RES', flavor: 'NAT', tienda: 1500, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
        { sku: 'CER-30G-N', name: 'Carne seca Cerdo 30g Natural', grams: 30, type: 'CER', flavor: 'NAT', tienda: 0, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
        { sku: 'CER-30G-P', name: 'Carne seca Cerdo 30g Picante', grams: 30, type: 'CER', flavor: 'CHI', tienda: 0, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
        { sku: 'CER-60G-N', name: 'Carne seca Cerdo 60g Natural', grams: 60, type: 'CER', flavor: 'NAT', tienda: 0, mayoreo: 0, distribuidor: 0, online: 0, stock: 0 },
    ];
    for (const p of nuevos) {
        const exists = await prisma.product.findUnique({
            where: { companyId_sku: { companyId: machete.id, sku: p.sku } },
        });
        if (exists) {
            await prisma.product.update({
                where: { id: exists.id },
                data: { priceMostrador: p.tienda, priceMayoreo: p.mayoreo, priceOnline: p.distribuidor, priceML: p.online },
            });
            console.log(`✅ ${p.sku} actualizado`);
            continue;
        }
        const pres = p.grams <= 30 ? '30G' : p.grams <= 60 ? '60G' : p.grams <= 120 ? '120G' : p.grams <= 500 ? '500G' : '1KG';
        const prod = await prisma.product.create({
            data: {
                companyId: machete.id,
                sku: p.sku, name: p.name,
                meatType: p.type, flavor: p.flavor,
                gramsWeight: p.grams, presentation: pres,
                priceMostrador: p.tienda, priceMayoreo: p.mayoreo,
                priceOnline: p.distribuidor, priceML: p.online,
                isActive: p.tienda > 0,
            },
        });
        await prisma.productStock.create({
            data: { productId: prod.id, stock: p.stock, minStock: 5 },
        });
        console.log(`✅ ${p.sku} creado${p.tienda === 0 ? ' (en desarrollo)' : ''}`);
    }
    console.log('\n🎉 Catálogo Machete actualizado!');
    console.log('💡 Productos de cerdo marcados como inactivos hasta tener precios');
    console.log('💡 Kilos sin precio online ni distribuidor — modifica desde Catálogo');
}
main()
    .catch(e => { console.error('❌ Error:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=update-precios-machete.js.map