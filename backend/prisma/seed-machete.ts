// backend/prisma/seed-machete.ts
// Ejecutar después del seed principal:
// npx ts-node prisma/seed-machete.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const TIPOS   = ['RES', 'CER'];
const SABORES = ['NAT', 'CHI', 'BBQ'];
const PRESENTACIONES = [
  { code:'100G', label:'100g',  grams:100  },
  { code:'250G', label:'250g',  grams:250  },
  { code:'500G', label:'500g',  grams:500  },
  { code:'1KG',  label:'1kg',   grams:1000 },
];

const TIPO_LABELS   = { RES:'Res',   CER:'Cerdo' };
const SABOR_LABELS  = { NAT:'Natural', CHI:'Chile rojo', BBQ:'BBQ' };

// Recetas base: ingredientes por 100g de producto terminado
const RECETAS_BASE: Record<string, {
  yield: number;
  ingredients: { inputName:string; quantityPer100g:number; unit:string }[];
}> = {
  'RES-NAT': { yield: 0.38, ingredients: [
    { inputName:'CARNE_RES',  quantityPer100g:0.263, unit:'kg' },
    { inputName:'SAL',        quantityPer100g:0.003, unit:'kg' },
    { inputName:'PIMIENTA',   quantityPer100g:0.001, unit:'kg' },
  ]},
  'RES-CHI': { yield: 0.37, ingredients: [
    { inputName:'CARNE_RES',  quantityPer100g:0.270, unit:'kg' },
    { inputName:'SAL',        quantityPer100g:0.003, unit:'kg' },
    { inputName:'CHILE_ROJO', quantityPer100g:0.010, unit:'kg' },
    { inputName:'AJO',        quantityPer100g:0.002, unit:'kg' },
  ]},
  'RES-BBQ': { yield: 0.36, ingredients: [
    { inputName:'CARNE_RES',  quantityPer100g:0.278, unit:'kg' },
    { inputName:'SAL',        quantityPer100g:0.002, unit:'kg' },
    { inputName:'SALSA_BBQ',  quantityPer100g:0.015, unit:'lt'  },
  ]},
  'CER-NAT': { yield: 0.40, ingredients: [
    { inputName:'CARNE_CER',  quantityPer100g:0.250, unit:'kg' },
    { inputName:'SAL',        quantityPer100g:0.003, unit:'kg' },
    { inputName:'PIMIENTA',   quantityPer100g:0.001, unit:'kg' },
  ]},
  'CER-CHI': { yield: 0.39, ingredients: [
    { inputName:'CARNE_CER',  quantityPer100g:0.256, unit:'kg' },
    { inputName:'SAL',        quantityPer100g:0.003, unit:'kg' },
    { inputName:'CHILE_ROJO', quantityPer100g:0.010, unit:'kg' },
    { inputName:'AJO',        quantityPer100g:0.002, unit:'kg' },
  ]},
  'CER-BBQ': { yield: 0.38, ingredients: [
    { inputName:'CARNE_CER',  quantityPer100g:0.263, unit:'kg' },
    { inputName:'SAL',        quantityPer100g:0.002, unit:'kg' },
    { inputName:'SALSA_BBQ',  quantityPer100g:0.015, unit:'lt'  },
  ]},
};

async function main() {
  console.log('🥩 Iniciando seed Machete...');

  const company = await prisma.company.findUnique({ where: { code: 'machete' } });
  if (!company) throw new Error('Empresa machete no encontrada. Ejecuta seed.ts primero.');

  // ── PRODUCTOS (todos los SKUs activos) ────────────────────
  for (const tipo of TIPOS) {
    for (const sabor of SABORES) {
      for (const pres of PRESENTACIONES) {
        const sku  = `${tipo}-${sabor}-${pres.code}`;
        const name = `${TIPO_LABELS[tipo as keyof typeof TIPO_LABELS]} ${SABOR_LABELS[sabor as keyof typeof SABOR_LABELS]} ${pres.label}`;

        const product = await prisma.product.upsert({
          where:  { companyId_sku: { companyId: company.id, sku } },
          update: {},
          create: {
            companyId:    company.id,
            sku, name,
            meatType:     tipo,
            flavor:       sabor,
            presentation: pres.code,
            gramsWeight:  pres.grams,
            isActive:     true,
          },
        });

        // Inicializar stock en 0 con mínimo de 5 unidades
        await prisma.productStock.upsert({
          where:  { productId: product.id },
          update: {},
          create: { productId: product.id, stock: 0, minStock: 5 },
        });
      }
    }
  }
  console.log('✅ Productos creados (24 SKUs activos)');

  // ── RECETAS INICIALES ─────────────────────────────────────
  for (const [key, receta] of Object.entries(RECETAS_BASE)) {
    // Solo crear si no existe ninguna versión
    const existing = await prisma.recipe.findFirst({
      where: { companyId: company.id, key },
    });
    if (existing) continue;

    await prisma.recipe.create({
      data: {
        companyId:        company.id,
        key,
        theoreticalYield: receta.yield,
        versionNumber:    1,
        isActive:         true,
        changeNote:       'Receta inicial',
        ingredients: {
          create: receta.ingredients,
        },
      },
    });
  }
  console.log('✅ Recetas iniciales creadas (6 combinaciones tipo × sabor)');

  // ── PRECIOS BASE INICIALES ────────────────────────────────
  const precios: Record<string, Record<string, number>> = {
    '100G': { mostrador:65,  mayoreo:55,  online:70,  ml:72  },
    '250G': { mostrador:145, mayoreo:125, online:155, ml:158 },
    '500G': { mostrador:270, mayoreo:235, online:285, ml:290 },
    '1KG':  { mostrador:510, mayoreo:450, online:535, ml:540 },
  };

  for (const tipo of TIPOS) {
    for (const sabor of SABORES) {
      for (const pres of PRESENTACIONES) {
        const sku = `${tipo}-${sabor}-${pres.code}`;
        const p   = precios[pres.code];
        await prisma.product.update({
          where: { companyId_sku: { companyId: company.id, sku } },
          data: {
            priceMostrador: p.mostrador,
            priceMayoreo:   p.mayoreo,
            priceOnline:    p.online,
            priceML:        p.ml,
          },
        });
      }
    }
  }
  console.log('✅ Precios base cargados');
  console.log('\n🎉 Seed Machete completado');
}

main().catch(console.error).finally(() => prisma.$disconnect());
