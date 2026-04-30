// seed-workaholic.js — usa SQL directo para evitar problemas de cliente Prisma
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const p = new PrismaClient();
const uid = () => crypto.randomUUID();

async function main() {
  const wk = await p.company.findFirst({
    where: { OR: [{ code: 'WORKAHOLIC' }, { name: { contains: 'Workaholic', mode: 'insensitive' } }] }
  });
  if (!wk) { console.error('❌ Workaholic no encontrada'); return; }
  const cid = wk.id;
  console.log(`\n🏢  Workaholic: ${wk.name} (${cid})\n`);

  // ═══════════════════════════════════════════════════
  // ESPACIOS — SQL directo
  // ═══════════════════════════════════════════════════
  console.log('── Espacios / Salas ──');

  // Crear tabla si no existe
  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS workaholic_spaces (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'SALA_JUNTAS',
      description TEXT,
      capacity INTEGER DEFAULT 1,
      "pricePerHour" DECIMAL(12,2),
      "pricePerDay" DECIMAL(12,2),
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `).catch(e => console.log('  tabla spaces ya existe'));

  const spaces = [
    { name:'Terraza',           type:'SALA_JUNTAS',      capacity:10,  pricePerHour:44,  pricePerDay:null,  desc:'Espacio con ventanas e iluminación natural. Ambiente relajado tipo old money.' },
    { name:'Sala B',            type:'SALA_JUNTAS',      capacity:10,  pricePerHour:44,  pricePerDay:null,  desc:'Espacio privado, sobrio y elegante. Ideal para negociaciones y entrevistas.' },
    { name:'Sala A',            type:'SALA_JUNTAS',      capacity:20,  pricePerHour:87,  pricePerDay:null,  desc:'Sala ejecutiva con mesa imperial. Ideal para juntas formales de hasta 20 personas.' },
    { name:'Sala Capacitaciones',type:'SALA_CAPACITACION',capacity:30, pricePerHour:146, pricePerDay:null,  desc:'Espacio versátil para talleres, cursos y presentaciones. Montaje flexible.' },
    { name:'Auditorio',         type:'SALA_CAPACITACION',capacity:60,  pricePerHour:200, pricePerDay:null,  desc:'Mayor capacidad. Proyector, bocinas, micrófono. Hasta 60 personas.' },
    { name:'Área Coworking',    type:'COWORKING',        capacity:40,  pricePerHour:null,pricePerDay:22,   desc:'Áreas comunes y espacios de trabajo compartidos. Internet alta velocidad.' },
  ];

  for (const sp of spaces) {
    const exists = await p.$queryRawUnsafe(
      `SELECT id FROM workaholic_spaces WHERE "companyId" = $1 AND name = $2 LIMIT 1`, cid, sp.name
    ).then(r => r.length > 0).catch(() => false);

    if (!exists) {
      await p.$executeRawUnsafe(`
        INSERT INTO workaholic_spaces (id,"companyId",name,type,description,capacity,"pricePerHour","pricePerDay","isActive","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,NOW(),NOW())
      `, uid(), cid, sp.name, sp.type, sp.desc, sp.capacity, sp.pricePerHour, sp.pricePerDay);
      console.log(`  ✅ ${sp.name}`);
    } else {
      console.log(`  ↺  ${sp.name} (ya existe)`);
    }
  }

  // ═══════════════════════════════════════════════════
  // TIPOS DE MEMBRESÍA — usa MembershipType (modelo compartido)
  // ═══════════════════════════════════════════════════
  console.log('\n── Tipos de Membresía ──');

  const memTypes = [
    { name:'Afterwork',  monthlyFee:65,  maxMembers:5,  desc:'Acceso nocturno desde las 7pm. Bar, hasta 4 acompañantes. $35 USD consumo/mes.' },
    { name:'Coworking',  monthlyFee:86,  maxMembers:1,  desc:'Acceso a áreas comunes, internet, 15 impresiones/mes. 1 invitado/día.' },
    { name:'Classic',    monthlyFee:129, maxMembers:1,  desc:'Domicilio comercial, 2 invitados/día, 25 impresiones, 10h salas/mes.' },
    { name:'Black',      monthlyFee:194, maxMembers:2,  desc:'1 titular + 1 cotitular, 4 invitados/día, 50 impresiones, 15h salas/mes.' },
    { name:'Platinum',   monthlyFee:259, maxMembers:3,  desc:'1 titular + 2 cotitulares, 6 invitados/día, 75 impresiones, 20h salas/mes, domicilio fiscal.' },
    { name:'Business',   monthlyFee:421, maxMembers:4,  desc:'1 titular + 3 cotitulares, 100 impresiones, 20h salas trad + 5h mega/mes.' },
  ];

  for (const mt of memTypes) {
    const existing = await p.membershipType.findFirst({ where: { companyId: cid, name: mt.name } }).catch(() => null);
    if (!existing) {
      await p.membershipType.create({
        data: { id: uid(), companyId: cid, entryFee: 0, monthlyFee: mt.monthlyFee,
                maxMembers: mt.maxMembers, graceDays: 5, isActive: true,
                name: mt.name, description: mt.desc }
      });
      console.log(`  ✅ ${mt.name}`);
    } else {
      await p.membershipType.update({ where: { id: existing.id }, data: { monthlyFee: mt.monthlyFee, description: mt.desc } });
      console.log(`  ↺  ${mt.name} (actualizado)`);
    }
  }

  // ═══════════════════════════════════════════════════
  // SERVICIOS DEL POS — SQL directo
  // ═══════════════════════════════════════════════════
  console.log('\n── Servicios del POS ──');

  await p.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS workaholic_services (
      id TEXT PRIMARY KEY,
      "companyId" TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'SERVICIO',
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `).catch(() => {});

  const services = [
    { name:'Day Pass',                             price:22,  cat:'ACCESO',    desc:'1 día en áreas comunes. Internet, café, 10 impresiones B/N.' },
    { name:'Passport (Day Pass + Sala + Alimento)',price:35,  cat:'ACCESO',    desc:'Day pass + 1h Terraza + 1 alimento del Menú Passport + soda.' },
    { name:'Terraza / Sala B — 1h',                price:44,  cat:'SALA',      desc:'Sala hasta 10 personas. Coffee break, pantalla, pizarrón.' },
    { name:'Sala A — 1h',                          price:87,  cat:'SALA',      desc:'Sala hasta 20 personas. Coffee break para 10, pantalla.' },
    { name:'Sala Capacitaciones — 1h',             price:146, cat:'SALA',      desc:'Hasta 30 personas. Proyector, coffee break 10 personas.' },
    { name:'Auditorio — 1h',                       price:200, cat:'SALA',      desc:'Hasta 60 personas. Proyector + bocinas + micrófono.' },
    { name:'Impresión B/N',                        price:1,   cat:'SERVICIO',  desc:'Por hoja.' },
    { name:'Impresión Color',                      price:3,   cat:'SERVICIO',  desc:'Por hoja.' },
    { name:'Escaneo',                              price:1,   cat:'SERVICIO',  desc:'Por página.' },
    { name:'Coca-Cola / Sprite / Crush',           price:33,  cat:'CAFETERIA', desc:'Soda en lata. Incluye versiones zero.' },
    { name:'Café Artesanal',                       price:50,  cat:'CAFETERIA', desc:'Americano, capuchino, latte, espresso.' },
    { name:'Agua Embotellada',                     price:20,  cat:'CAFETERIA', desc:'Natural, mineral o alcalina.' },
    { name:'Snack / Botana',                       price:45,  cat:'CAFETERIA', desc:'Carne seca, Sun Chips, nueces, etc.' },
    { name:'Huevo con salchicha',                  price:169, cat:'ALIMENTO',  desc:'Desayuno completo.' },
    { name:'Omelette con tocino',                  price:169, cat:'ALIMENTO',  desc:'Desayuno completo.' },
    { name:'Torta de milanesa',                    price:169, cat:'ALIMENTO',  desc:'Torta clásica.' },
    { name:'Ensalada (César/Casino/Ranch)',         price:169, cat:'ALIMENTO',  desc:'Ensalada a elegir.' },
    { name:'Hamburguesa Bacon',                    price:169, cat:'ALIMENTO',  desc:'Hamburguesa con tocino.' },
    { name:'Wrap (Ranch/Búfalo/César)',            price:169, cat:'ALIMENTO',  desc:'Wrap a elegir.' },
  ];

  for (const svc of services) {
    const exists = await p.$queryRawUnsafe(
      `SELECT id FROM workaholic_services WHERE "companyId" = $1 AND name = $2 LIMIT 1`, cid, svc.name
    ).then(r => r.length > 0).catch(() => false);

    if (!exists) {
      await p.$executeRawUnsafe(`
        INSERT INTO workaholic_services (id,"companyId",name,description,category,price,"isActive","createdAt","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,true,NOW(),NOW())
      `, uid(), cid, svc.name, svc.desc, svc.cat, svc.price);
      console.log(`  ✅ ${svc.name}`);
    } else {
      console.log(`  ↺  ${svc.name}`);
    }
  }

  console.log(`\n✅ Workaholic seed completado`);
  console.log(`   ${spaces.length} espacios  |  ${memTypes.length} membresías  |  ${services.length} servicios`);
  await p.$disconnect();
}

main().catch(e => { console.error('❌', e.message); p.$disconnect(); process.exit(1); });
