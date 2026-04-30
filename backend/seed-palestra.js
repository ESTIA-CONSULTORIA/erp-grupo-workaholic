// seed-palestra.js
// Correr EN Railway: node seed-palestra.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const p = new PrismaClient();

const uid = () => crypto.randomUUID();

async function upsert(model, where, data) {
  const existing = await p[model].findFirst({ where }).catch(() => null);
  if (existing) {
    await p[model].update({ where: { id: existing.id }, data });
    console.log(`  ↺  ${data.name || data.id}`);
  } else {
    await p[model].create({ data: { id: uid(), ...data } });
    console.log(`  ✅ ${data.name || data.id}`);
  }
}

async function main() {
  const palestra = await p.company.findFirst({
    where: { OR: [{ code: 'PALESTRA' }, { name: { contains: 'Palestra', mode: 'insensitive' } }] }
  });
  if (!palestra) { console.error('❌ Palestra no encontrada'); return; }
  const cid = palestra.id;
  console.log(`\n🏋  Palestra: ${palestra.name} (${cid})\n`);

  // ══════════════════════════════════════════════════
  // TIPOS DE MEMBRESÍA
  // ══════════════════════════════════════════════════
  console.log('── Tipos de Membresía ──');
  const types = [
    { name:'Personal',    entryFee:1500, monthlyFee:100, maxMembers:2,
      description:'1 Adulto o 1 Joven (<26 años). Cancha 25% desc, 1 MasterClass GRATIS/mes, Gimnasio, Spinning, Kids Club.' },
    { name:'Familiar',    entryFee:2950, monthlyFee:195, maxMembers:5,
      description:'1 Adulto + hasta 4 adicionales. 2 MasterClass GRATIS/mes. 5h clínicas/mes. Reserva cancha 4 semanas antes.' },
    { name:'Empresarial', entryFee:4500, monthlyFee:290, maxMembers:8,
      description:'Hasta 8 personas. 4 MasterClass GRATIS/mes. 10h clínicas/mes. Upgrade a Familiar disponible por +$90 USD/mes.' },
  ];
  for (const t of types) {
    await upsert('membershipType',
      { companyId: cid, name: t.name },
      { companyId: cid, graceDays: 5, isActive: true, ...t }
    );
  }

  // ══════════════════════════════════════════════════
  // SERVICIOS / PRODUCTOS DEL POS
  // Usan PalestraProduct (sku requerido, sin coachable)
  // ══════════════════════════════════════════════════
  console.log('\n── Servicios del POS ──');
  const services = [
    // Renta cancha público
    {sku:'CAN-PUB-1P', name:'Renta Cancha 1h — 1 persona (Público)',   price:950,  category:'CANCHA'},
    {sku:'CAN-PUB-2P', name:'Renta Cancha 1h — 2 personas (Público)',  price:1050, category:'CANCHA'},
    {sku:'CAN-PUB-3P', name:'Renta Cancha 1h — 3 personas (Público)',  price:1150, category:'CANCHA'},
    {sku:'CAN-PUB-4P', name:'Renta Cancha 1h — 4 personas (Público)',  price:1250, category:'CANCHA'},
    // Renta cancha miembro (25% desc)
    {sku:'CAN-MEM-1P', name:'Renta Cancha 1h — 1 persona (Miembro)',   price:760,  category:'CANCHA'},
    {sku:'CAN-MEM-2P', name:'Renta Cancha 1h — 2 personas (Miembro)',  price:840,  category:'CANCHA'},
    {sku:'CAN-MEM-3P', name:'Renta Cancha 1h — 3 personas (Miembro)',  price:920,  category:'CANCHA'},
    {sku:'CAN-MEM-4P', name:'Renta Cancha 1h — 4 personas (Miembro)',  price:1000, category:'CANCHA'},
    // Horarios especiales
    {sku:'CAN-SOM-TAR', name:'Cancha Sombra 11am-4pm',                 price:550,  category:'CANCHA'},
    {sku:'CAN-SOM-NOC', name:'Cancha Sombra 4pm-1am',                  price:600,  category:'CANCHA'},
    {sku:'CAN-PAN-MAÑ', name:'Cancha Panorámica 5am-11am',             price:600,  category:'CANCHA'},
    // Academia privada
    {sku:'ACA-1P-1H',  name:'Clase Privada 1h — 1 persona',            price:950,  category:'ACADEMIA'},
    {sku:'ACA-2P-1H',  name:'Clase Privada 1h — 2 personas',           price:1050, category:'ACADEMIA'},
    {sku:'ACA-3P-1H',  name:'Clase Privada 1h — 3 personas',           price:1150, category:'ACADEMIA'},
    {sku:'ACA-4P-1H',  name:'Clase Privada 1h — 4 personas',           price:1250, category:'ACADEMIA'},
    {sku:'ACA-INF-MES',name:'Academia Infantil (mensual 2×semana)',     price:1600, category:'ACADEMIA'},
    // MasterClass
    {sku:'MAS-SAB-GRP', name:'MasterClass Pádel Grupal (Sáb)',         price:0,    category:'CLINICA'},
    // Amenidades
    {sku:'ALB-PUB-1H',  name:'Alberca 1 hora — Público',               price:80,   category:'AMENIDAD'},
    {sku:'ALB-MEM-1H',  name:'Alberca 1 hora — Miembro',               price:40,   category:'AMENIDAD'},
    {sku:'KIDS-DIA',    name:'Kids Club (día)',                         price:50,   category:'AMENIDAD'},
    {sku:'GIM-MES-PUB', name:'Gimnasio mensual — Público',             price:1200, category:'AMENIDAD'},
    {sku:'SPI-MES-PUB', name:'Spinning mensual — Público',             price:1000, category:'AMENIDAD'},
    // Zona social
    {sku:'TER-PUB-4H',  name:'Terraza Exterior 4h — Público',          price:2000, category:'SOCIAL'},
    {sku:'TER-MEM-4H',  name:'Terraza Exterior 4h — Miembro',          price:1000, category:'SOCIAL'},
    {sku:'ASA-PUB',     name:'Área Asador en Cancha — Público',        price:750,  category:'SOCIAL'},
    {sku:'ASA-MEM',     name:'Área Asador en Cancha — Miembro',        price:250,  category:'SOCIAL'},
    {sku:'EST-PUB-DIA', name:'Estacionamiento (día) — Público',        price:10,   category:'SOCIAL'},
    // Equipo
    {sku:'EQU-PALA',    name:'Renta de Pala',                          price:50,   category:'EQUIPO'},
  ];

  for (const svc of services) {
    await upsert('palestraProduct',
      { companyId: cid, sku: svc.sku },
      { companyId: cid, cost: 0, stock: 999, minStock: 0, isActive: true, ...svc }
    );
  }

  console.log('\n✅ Seed Palestra completado exitosamente');
  console.log(`   ${types.length} tipos de membresía`);
  console.log(`   ${services.length} servicios en el POS`);
  await p.$disconnect();
}

main().catch(e => { console.error('❌', e.message); p.$disconnect(); process.exit(1); });
