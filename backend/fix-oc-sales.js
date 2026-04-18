// Script para crear registros Sale de OC existentes que no tienen Sale
// Correr UNA VEZ: node fix-oc-sales.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Buscando OC sin Sale asociado...');
  
  const ocs = await prisma.ordenCompra.findMany({
    where: { status: { not: 'CANCELADA' } },
    include: { lineas: { include: { product: true } } },
  });
  
  console.log(`Found ${ocs.length} OC activas`);
  
  let created = 0;
  for (const oc of ocs) {
    // Check if Sale already exists for this OC (same date, clientId, amount)
    const existing = await prisma.sale.findFirst({
      where: {
        companyId: oc.companyId,
        clientId:  oc.clientId,
        total:     oc.montoTotal,
        isCredit:  true,
        date: {
          gte: new Date(new Date(oc.fecha).setHours(0,0,0,0)),
          lte: new Date(new Date(oc.fecha).setHours(23,59,59,999)),
        },
      },
    });
    
    if (existing) {
      console.log(`  OC ${oc.numero}: Sale ya existe, skip`);
      continue;
    }
    
    try {
      await prisma.sale.create({
        data: {
          companyId:     oc.companyId,
          clientId:      oc.clientId,
          date:          new Date(oc.fecha),
          channel:       oc.canal || 'MOSTRADOR',
          isCredit:      true,
          total:         oc.montoTotal,
          paymentMethod: 'CREDITO_CLIENTE',
          lines: oc.lineas.length > 0 ? {
            create: oc.lineas.map(l => ({
              productId: l.productId,
              quantity:  l.cantidad,
              unitPrice: l.precioUnitario,
              total:     l.total,
            })),
          } : undefined,
        },
      });
      console.log(`  OC ${oc.numero}: Sale creado ✓ ($${oc.montoTotal})`);
      created++;
    } catch (e) {
      console.error(`  OC ${oc.numero}: ERROR — ${e.message}`);
    }
  }
  
  console.log(`\nListo: ${created} Sales creados`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
