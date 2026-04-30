// seed-palestra.js — SQL directo para evitar problemas de cliente Prisma
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const p = new PrismaClient();
const uid = () => crypto.randomUUID();

async function main() {
  const palestra = await p.company.findFirst({
    where: { OR: [{ code: 'PALESTRA' }, { name: { contains: 'Palestra', mode: 'insensitive' } }] }
  });
  if (!palestra) { console.error('❌ Palestra no encontrada'); return; }
  const cid = palestra.id;
  console.log(`\n🏋  Palestra: ${palestra.name} (${cid})\n`);

  // ═══════════════════════════════════════════════════
  // TIPOS DE MEMBRESÍA (usa MembershipType — modelo compartido)
  // ═══════════════════════════════════════════════════
  console.log('── Tipos de Membresía ──');
  const memTypes = [
    { name:'Personal',    entryFee:1500, monthlyFee:100, maxMembers:2,
      desc:'1 Adulto o 1 Joven (<26 años). Cancha 25% desc, 1 MasterClass GRATIS/mes, Gimnasio, Spinning, Kids Club.' },
    { name:'Familiar',    entryFee:2950, monthlyFee:195, maxMembers:5,
      desc:'Hasta 5 personas. 2 MasterClass GRATIS/mes. 5h clínicas/mes. Reserva cancha 4 semanas antes.' },
    { name:'Empresarial', entryFee:4500, monthlyFee:290, maxMembers:8,
      desc:'Hasta 8 personas. 4 MasterClass GRATIS/mes. 10h clínicas/mes. Upgrade a Familiar +$90 USD/mes.' },
  ];

  for (const mt of memTypes) {
    const existing = await p.membershipType.findFirst({ where: { companyId: cid, name: mt.name } }).catch(() => null);
    if (!existing) {
      await p.membershipType.create({
        data: { id: uid(), companyId: cid, entryFee: mt.entryFee, monthlyFee: mt.monthlyFee,
                maxMembers: mt.maxMembers, graceDays: 5, isActive: true,
                name: mt.name, description: mt.desc }
      });
      console.log(`  ✅ ${mt.name}`);
    } else {
      await p.membershipType.update({ where: { id: existing.id },
        data: { entryFee: mt.entryFee, monthlyFee: mt.monthlyFee, description: mt.desc } });
      console.log(`  ↺  ${mt.name} (actualizado)`);
    }
  }

  // ═══════════════════════════════════════════════════
  // SERVICIOS DEL POS (palestra_products) — SQL directo
  // ═══════════════════════════════════════════════════
  console.log('\n── Servicios / Productos del POS ──');

  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS palestra_products (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'GENERAL',
      description TEXT,
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      cost DECIMAL(12,2) NOT NULL DEFAULT 0,
      stock DECIMAL(10,2) NOT NULL DEFAULT 999,
      "minStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
      "imageUrl" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE("companyId", sku)
    )
  `).catch(() => {});

  const services = [
    { sku:'CAN-PUB-1P',  name:'Renta Cancha 1h — 1 persona (Público)',   price:950,  cat:'CANCHA' },
    { sku:'CAN-PUB-2P',  name:'Renta Cancha 1h — 2 personas (Público)',  price:1050, cat:'CANCHA' },
    { sku:'CAN-PUB-3P',  name:'Renta Cancha 1h — 3 personas (Público)',  price:1150, cat:'CANCHA' },
    { sku:'CAN-PUB-4P',  name:'Renta Cancha 1h — 4 personas (Público)',  price:1250, cat:'CANCHA' },
    { sku:'CAN-MEM-1P',  name:'Renta Cancha 1h — 1 persona (Miembro)',   price:760,  cat:'CANCHA' },
    { sku:'CAN-MEM-2P',  name:'Renta Cancha 1h — 2 personas (Miembro)',  price:840,  cat:'CANCHA' },
    { sku:'CAN-MEM-3P',  name:'Renta Cancha 1h — 3 personas (Miembro)',  price:920,  cat:'CANCHA' },
    { sku:'CAN-MEM-4P',  name:'Renta Cancha 1h — 4 personas (Miembro)',  price:1000, cat:'CANCHA' },
    { sku:'CAN-SOM-TAR', name:'Cancha Sombra 11am-4pm',                  price:550,  cat:'CANCHA' },
    { sku:'CAN-SOM-NOC', name:'Cancha Sombra 4pm-1am',                   price:600,  cat:'CANCHA' },
    { sku:'CAN-PAN-MAN', name:'Cancha Panorámica 5am-11am',              price:600,  cat:'CANCHA' },
    { sku:'ACA-1P-1H',   name:'Clase Privada 1h — 1 persona',            price:950,  cat:'ACADEMIA' },
    { sku:'ACA-2P-1H',   name:'Clase Privada 1h — 2 personas',           price:1050, cat:'ACADEMIA' },
    { sku:'ACA-3P-1H',   name:'Clase Privada 1h — 3 personas',           price:1150, cat:'ACADEMIA' },
    { sku:'ACA-4P-1H',   name:'Clase Privada 1h — 4 personas',           price:1250, cat:'ACADEMIA' },
    { sku:'ACA-INF-MES', name:'Academia Infantil mensual (2×semana)',     price:1600, cat:'ACADEMIA' },
    { sku:'MAS-SAB-GRP', name:'MasterClass Pádel Grupal (Sábado)',        price:0,    cat:'CLINICA'  },
    { sku:'ALB-PUB-1H',  name:'Alberca 1 hora — Público',                price:80,   cat:'AMENIDAD' },
    { sku:'ALB-MEM-1H',  name:'Alberca 1 hora — Miembro',                price:40,   cat:'AMENIDAD' },
    { sku:'KIDS-DIA',    name:'Kids Club (día)',                          price:50,   cat:'AMENIDAD' },
    { sku:'GIM-MES-PUB', name:'Gimnasio mensual — Público',              price:1200, cat:'AMENIDAD' },
    { sku:'SPI-MES-PUB', name:'Spinning mensual — Público',              price:1000, cat:'AMENIDAD' },
    { sku:'TER-PUB-4H',  name:'Terraza Exterior 4h — Público',           price:2000, cat:'SOCIAL'   },
    { sku:'TER-MEM-4H',  name:'Terraza Exterior 4h — Miembro',           price:1000, cat:'SOCIAL'   },
    { sku:'ASA-PUB',     name:'Área Asador en Cancha — Público',         price:750,  cat:'SOCIAL'   },
    { sku:'ASA-MEM',     name:'Área Asador en Cancha — Miembro',         price:250,  cat:'SOCIAL'   },
    { sku:'EST-PUB-DIA', name:'Estacionamiento (día) — Público',         price:10,   cat:'SOCIAL'   },
    { sku:'EQU-PALA',    name:'Renta de Pala',                           price:50,   cat:'EQUIPO'   },
  ];

  for (const svc of services) {
    const exists = await p.$queryRawUnsafe(
      `SELECT id FROM palestra_products WHERE "companyId" = $1 AND sku = $2 LIMIT 1`, cid, svc.sku
    ).then(r => r.length > 0).catch(() => false);

    if (!exists) {
      await p.$executeRawUnsafe(`
        INSERT INTO palestra_products (id,"companyId",sku,name,category,price,cost,stock,"minStock","isActive","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,0,999,0,true,NOW(),NOW())
      `, uid(), cid, svc.sku, svc.name, svc.cat, svc.price);
      console.log(`  ✅ ${svc.name}`);
    } else {
      await p.$executeRawUnsafe(
        `UPDATE palestra_products SET price=$1, "updatedAt"=NOW() WHERE "companyId"=$2 AND sku=$3`,
        svc.price, cid, svc.sku
      );
      console.log(`  ↺  ${svc.name}`);
    }
  }

  console.log(`\n✅ Palestra seed completado`);
  console.log(`   ${memTypes.length} membresías  |  ${services.length} servicios en el POS`);
  await p.$disconnect();
}

main().catch(e => { console.error('❌', e.message); p.$disconnect(); process.exit(1); });
