import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🥩 Cargando catálogo Machete...');

  const machete = await prisma.company.findUnique({ where: { code: 'MACHETE' } });
  if (!machete) throw new Error('Empresa MACHETE no encontrada');

  // ── INSUMOS POR GRUPO ─────────────────────────────────────
  const insumos = [
    // CARNES FRESCAS
    { sku:'INS-CARNE-RES',    name:'Carne de res cruda',          unit:'kg', costUnit:210.00, group:'CARNES_FRESCAS'   },
    { sku:'INS-CARNE-CERDO',  name:'Carne de cerdo cruda',        unit:'kg', costUnit:180.00, group:'CARNES_FRESCAS'   },
    { sku:'INS-CARNE-HORNO',  name:'Carne horno',                 unit:'kg', costUnit:180.00, group:'CARNES_FRESCAS'   },
    // CARNES SECAS
    { sku:'INS-MACHACA-KG',   name:'Machaca kg',                  unit:'kg', costUnit:280.00, group:'CARNES_SECAS'     },
    { sku:'INS-CARNE-SCRAP',  name:'Scrap carne en seco',         unit:'kg', costUnit:1.10,   group:'CARNES_SECAS'     },
    { sku:'INS-CARNE-SECA',   name:'Carne en seco sin empacar',   unit:'kg', costUnit:1.10,   group:'CARNES_SECAS'     },
    { sku:'INS-CARNE-CERDO-S',name:'Carne cerdo seca sin empacar',unit:'kg', costUnit:1.10,   group:'CARNES_SECAS'     },
    // ESPECIAS
    { sku:'INS-AJO',          name:'Ajo granulado',               unit:'kg', costUnit:75.00,  group:'ESPECIAS'         },
    { sku:'INS-CHILE-ARBOL',  name:'Chile de árbol',              unit:'kg', costUnit:50.00,  group:'ESPECIAS'         },
    { sku:'INS-PIMIENTA',     name:'Pimienta molida',             unit:'kg', costUnit:135.00, group:'ESPECIAS'         },
    { sku:'INS-ROMERO',       name:'Romero',                      unit:'kg', costUnit:90.00,  group:'ESPECIAS'         },
    { sku:'INS-SAL-GRANO',    name:'Sal de grano',                unit:'kg', costUnit:30.00,  group:'ESPECIAS'         },
    { sku:'INS-VALENTINA',    name:'Salsa Valentina 1lt',         unit:'lt', costUnit:44.21,  group:'ESPECIAS'         },
    { sku:'INS-SONORA',       name:'Salsa Sonora 20ml',           unit:'pz', costUnit:0.50,   group:'ESPECIAS'         },
    { sku:'INS-ESP-MOLIDA',   name:'Especias molidas',            unit:'kg', costUnit:80.00,  group:'ESPECIAS'         },
    { sku:'INS-ESP-SAL',      name:'Especias molidas con sal',    unit:'kg', costUnit:34.54,  group:'ESPECIAS'         },
    // EMPAQUE BOLSAS
    { sku:'INS-BOLSA-25G',    name:'Bolsa celofán Chicali 25g',   unit:'pz', costUnit:1.00,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-30G-N',  name:'Bolsa Machete 30g natural',   unit:'pz', costUnit:2.45,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-30G-P',  name:'Bolsa Machete 30g picante',   unit:'pz', costUnit:2.45,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-60G-N',  name:'Bolsa Machete 60g natural',   unit:'pz', costUnit:2.49,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-60G-P',  name:'Bolsa Machete 60g picante',   unit:'pz', costUnit:2.49,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-120G-N', name:'Bolsa Machete 120g natural',  unit:'pz', costUnit:3.33,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-120G-P', name:'Bolsa Machete 120g picante',  unit:'pz', costUnit:3.33,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-MAC90',  name:'Bolsa Machaca 90g',           unit:'pz', costUnit:3.28,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-MAC1K',  name:'Bolsa Machaca 1kg',           unit:'pz', costUnit:6.05,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-CHI1K',  name:'Bolsa Chicali 1kg',           unit:'pz', costUnit:2.32,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-45G',    name:'Bolsa plástico 45g',          unit:'pz', costUnit:5.61,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-KRAFT',  name:'Bolsa kraft 200g',            unit:'pz', costUnit:7.59,   group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-15X25',  name:'Bolsa celofán 15x25',         unit:'pz', costUnit:97.22,  group:'EMPAQUE_BOLSAS'   },
    { sku:'INS-BOLSA-CER60',  name:'Bolsa cerdo picante 60g',     unit:'pz', costUnit:2.49,   group:'EMPAQUE_BOLSAS'   },
    // EMPAQUE ETIQUETAS
    { sku:'INS-ETQ-MAC90',    name:'Etiqueta Machaca 90g',        unit:'pz', costUnit:2.99,   group:'EMPAQUE_ETIQUETAS'},
    { sku:'INS-ETQ-CHI1K',    name:'Etiqueta Chicali caja/kilo',  unit:'pz', costUnit:2.99,   group:'EMPAQUE_ETIQUETAS'},
    { sku:'INS-ETQ-MCH1K',    name:'Etiqueta Machete caja/kilo',  unit:'pz', costUnit:2.99,   group:'EMPAQUE_ETIQUETAS'},
    { sku:'INS-STICKER-CH',   name:'Sticker picante chico',       unit:'pz', costUnit:0.023,  group:'EMPAQUE_ETIQUETAS'},
    { sku:'INS-STICKER-GR',   name:'Sticker picante grande',      unit:'pz', costUnit:0.029,  group:'EMPAQUE_ETIQUETAS'},
    { sku:'INS-CB-30G',       name:'Código de barra 30g chile',   unit:'pz', costUnit:0.023,  group:'EMPAQUE_ETIQUETAS'},
    { sku:'INS-CB-60G',       name:'Código de barra 60g chile',   unit:'pz', costUnit:0.023,  group:'EMPAQUE_ETIQUETAS'},
    { sku:'INS-CB-120G',      name:'Código de barra 120g chile',  unit:'pz', costUnit:0.023,  group:'EMPAQUE_ETIQUETAS'},
    // EMPAQUE CAJAS Y FRASCOS
    { sku:'INS-CAJA-14',      name:'Caja 14x14x14',               unit:'pz', costUnit:32.00,  group:'EMPAQUE_CAJAS'    },
    { sku:'INS-CAJA-ENVIO',   name:'Caja chica para envío',       unit:'pz', costUnit:32.00,  group:'EMPAQUE_CAJAS'    },
    { sku:'INS-FRASCO-100G',  name:'Frasco 100g escarchado',      unit:'pz', costUnit:15.25,  group:'EMPAQUE_CAJAS'    },
  ];

  for (const ins of insumos) {
    await (prisma as any).insumo.upsert({
      where: { companyId_sku: { companyId: machete.id, sku: ins.sku } },
      update: { name: ins.name, costUnit: ins.costUnit, group: ins.group },
      create: {
        companyId: machete.id,
        sku:       ins.sku,
        name:      ins.name,
        unit:      ins.unit,
        costUnit:  ins.costUnit,
        group:     ins.group,
        isActive:  true,
      },
    });
  }
  console.log(`✅ ${insumos.length} insumos cargados en 6 grupos`);

  // ── PRODUCTOS TERMINADOS ──────────────────────────────────
  const productos = [
    { sku:'MCH-30G-N',  name:'Carne seca Machete 30g Natural',  grams:30,   type:'RES', flavor:'NAT', priceMostrador:42,  priceMayoreo:35,  priceOnline:45,  priceML:48   },
    { sku:'MCH-60G-N',  name:'Carne seca Machete 60g Natural',  grams:60,   type:'RES', flavor:'NAT', priceMostrador:80,  priceMayoreo:70,  priceOnline:85,  priceML:90   },
    { sku:'MCH-120G-N', name:'Carne seca Machete 120g Natural', grams:120,  type:'RES', flavor:'NAT', priceMostrador:155, priceMayoreo:135, priceOnline:165, priceML:175  },
    { sku:'MCH-30G-P',  name:'Carne seca Machete 30g Chile',    grams:30,   type:'RES', flavor:'CHI', priceMostrador:42,  priceMayoreo:35,  priceOnline:45,  priceML:48   },
    { sku:'MCH-60G-P',  name:'Carne seca Machete 60g Chile',    grams:60,   type:'RES', flavor:'CHI', priceMostrador:80,  priceMayoreo:70,  priceOnline:85,  priceML:90   },
    { sku:'MCH-120G-P', name:'Carne seca Machete 120g Chile',   grams:120,  type:'RES', flavor:'CHI', priceMostrador:155, priceMayoreo:135, priceOnline:165, priceML:175  },
    { sku:'CHI-25G-N',  name:'Carne seca Chicali 25g Natural',  grams:25,   type:'RES', flavor:'NAT', priceMostrador:30,  priceMayoreo:25,  priceOnline:32,  priceML:35   },
    { sku:'CHI-100G-N', name:'Chicali 100g Natural',            grams:100,  type:'RES', flavor:'NAT', priceMostrador:120, priceMayoreo:100, priceOnline:130, priceML:140  },
    { sku:'CHI-100G-P', name:'Chicali 100g Chile',              grams:100,  type:'RES', flavor:'CHI', priceMostrador:120, priceMayoreo:100, priceOnline:130, priceML:140  },
    { sku:'CHI-500G-N', name:'Chicali 500g Natural',            grams:500,  type:'RES', flavor:'NAT', priceMostrador:500, priceMayoreo:450, priceOnline:550, priceML:580  },
    { sku:'CHI-500G-P', name:'Chicali 500g Chile',              grams:500,  type:'RES', flavor:'CHI', priceMostrador:500, priceMayoreo:450, priceOnline:550, priceML:580  },
    { sku:'CHI-900G-N', name:'Chicali Jumbo 900g Natural',      grams:900,  type:'RES', flavor:'NAT', priceMostrador:900, priceMayoreo:800, priceOnline:950, priceML:1000 },
    { sku:'CHI-900G-P', name:'Chicali Jumbo 900g Chile',        grams:900,  type:'RES', flavor:'CHI', priceMostrador:900, priceMayoreo:800, priceOnline:950, priceML:1000 },
    { sku:'MAC-90G',    name:'Machaca Machete 90g',             grams:90,   type:'RES', flavor:'NAT', priceMostrador:90,  priceMayoreo:75,  priceOnline:95,  priceML:100  },
    { sku:'MAC-500G',   name:'Machaca Machete 500g',            grams:500,  type:'RES', flavor:'NAT', priceMostrador:450, priceMayoreo:400, priceOnline:480, priceML:500  },
    { sku:'MAC-1KG',    name:'Machaca Machete 1kg',             grams:1000, type:'RES', flavor:'NAT', priceMostrador:700, priceMayoreo:620, priceOnline:750, priceML:800  },
    { sku:'CER-60G-P',  name:'Cerdo picante 60g',               grams:60,   type:'CER', flavor:'CHI', priceMostrador:80,  priceMayoreo:70,  priceOnline:85,  priceML:90   },
    { sku:'ESC-100G',   name:'Escarchado Carne Seca 100g',      grams:100,  type:'RES', flavor:'NAT', priceMostrador:120, priceMayoreo:100, priceOnline:130, priceML:140  },
    { sku:'MCH-900G-N', name:'Kilo Machete Natural 900g',       grams:900,  type:'RES', flavor:'NAT', priceMostrador:900, priceMayoreo:800, priceOnline:950, priceML:1000 },
    { sku:'MCH-900G-P', name:'Kilo Machete Chile 900g',         grams:900,  type:'RES', flavor:'CHI', priceMostrador:900, priceMayoreo:800, priceOnline:950, priceML:1000 },
    { sku:'SCR-1KG',    name:'Kilo Scrap',                      grams:1000, type:'RES', flavor:'NAT', priceMostrador:700, priceMayoreo:600, priceOnline:750, priceML:800  },
  ];

  const stockMap: Record<string, number> = {
    'MCH-30G-N':21,'MCH-60G-N':540,'MCH-120G-N':486,
    'MCH-30G-P':72,'MCH-60G-P':437,'MCH-120G-P':1827,
    'CHI-25G-N':35,'CHI-100G-N':30,'CHI-100G-P':31,
    'CHI-500G-N':3,'CHI-500G-P':3,
    'CHI-900G-N':4,'CHI-900G-P':2,
    'MAC-90G':5,'MAC-1KG':1,
    'CER-60G-P':99,'ESC-100G':5,'SCR-1KG':7,
  };

  for (const p of productos) {
    const pres = p.grams<=30?'30G':p.grams<=60?'60G':p.grams<=120?'120G':p.grams<=500?'500G':'1KG';
    const prod = await prisma.product.upsert({
      where:  { companyId_sku: { companyId: machete.id, sku: p.sku } },
      update: { name:p.name, priceMostrador:p.priceMostrador, priceMayoreo:p.priceMayoreo, priceOnline:p.priceOnline, priceML:p.priceML },
      create: {
        companyId:machete.id, sku:p.sku, name:p.name,
        meatType:p.type, flavor:p.flavor, gramsWeight:p.grams, presentation:pres,
        priceMostrador:p.priceMostrador, priceMayoreo:p.priceMayoreo,
        priceOnline:p.priceOnline, priceML:p.priceML, isActive:true,
      },
    });
    const stock = stockMap[p.sku]||0;
    await prisma.productStock.upsert({
      where:  { productId: prod.id },
      update: { stock },
      create: { productId:prod.id, stock, minStock:5 },
    });
  }
  console.log(`✅ ${productos.length} productos terminados cargados`);
  console.log('\n🎉 Catálogo Machete listo!');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
