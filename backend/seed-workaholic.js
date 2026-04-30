// seed-workaholic.js
// Correr EN Railway: node seed-workaholic.js
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const p = new PrismaClient();
const uid = () => crypto.randomUUID();

// Tipo de cambio USD → MXN (precio automático = USD × 1.4 según hoja)
const TC = 17;   // referencia interna, los precios en USD se guardan en USD

async function upsert(model, whereKey, data) {
  const existing = await p[model].findFirst({ where: whereKey }).catch(() => null);
  if (existing) {
    await p[model].update({ where: { id: existing.id }, data });
    process.stdout.write(`  ↺  ${data.name}\n`);
  } else {
    await p[model].create({ data: { id: uid(), ...data } });
    process.stdout.write(`  ✅ ${data.name}\n`);
  }
}

async function main() {
  const wk = await p.company.findFirst({
    where: { OR: [{ code: 'WORKAHOLIC' }, { name: { contains: 'Workaholic', mode: 'insensitive' } }] }
  });
  if (!wk) { console.error('❌ Workaholic no encontrada'); return; }
  const cid = wk.id;
  console.log(`\n🏢  Workaholic: ${wk.name} (${cid})\n`);

  // ══════════════════════════════════════════════════════
  // ESPACIOS (WorkaholicSpace) — Salas de juntas
  // ══════════════════════════════════════════════════════
  console.log('── Espacios / Salas de Juntas ──');
  const spaces = [
    {
      name: 'Terraza',
      type: 'SALA_JUNTAS',
      description: 'Espacio con ventanas e iluminación natural. Ambiente relajado tipo old money con detalles artísticos.',
      capacity: 10,
      pricePerHour: 44,   // USD/hr — miembros pagan, visita paga $44
      pricePerDay: null,
      isActive: true,
    },
    {
      name: 'Sala B',
      type: 'SALA_JUNTAS',
      description: 'Espacio privado, sobrio y elegante. Ideal para reuniones estratégicas, entrevistas y negociaciones.',
      capacity: 10,
      pricePerHour: 44,
      pricePerDay: null,
      isActive: true,
    },
    {
      name: 'Sala A',
      type: 'SALA_JUNTAS',
      description: 'Sala ejecutiva con mesa imperial. Ideal para juntas formales y presentaciones de proyectos.',
      capacity: 20,
      pricePerHour: 87,
      pricePerDay: null,
      isActive: true,
    },
    {
      name: 'Sala Capacitaciones',
      type: 'SALA_CAPACITACION',
      description: 'Espacio versátil para talleres, cursos y presentaciones grupales. Montaje flexible.',
      capacity: 30,
      pricePerHour: 146,
      pricePerDay: null,
      isActive: true,
    },
    {
      name: 'Auditorio',
      type: 'SALA_CAPACITACION',
      description: 'Mayor capacidad. Ideal para conferencias, lanzamientos y capacitaciones de gran formato.',
      capacity: 60,
      pricePerHour: 200,
      pricePerDay: null,
      isActive: true,
    },
    {
      name: 'Área Coworking',
      type: 'COWORKING',
      description: 'Áreas comunes y espacios de trabajo compartidos. Internet alta velocidad.',
      capacity: 40,
      pricePerHour: null,
      pricePerDay: 22,   // Day pass: $22 USD
      isActive: true,
    },
  ];

  for (const sp of spaces) {
    await upsert('workaholicSpace',
      { companyId: cid, name: sp.name },
      { companyId: cid, ...sp }
    );
  }

  // ══════════════════════════════════════════════════════
  // TIPOS DE MEMBRESÍA
  // ══════════════════════════════════════════════════════
  console.log('\n── Tipos de Membresía ──');
  const memTypes = [
    {
      name: 'Afterwork',
      description: 'Acceso nocturno desde las 7pm. Área de bar, entrada para ti y hasta 4 acompañantes. $35 USD consumo/mes.',
      entryFee: 0,
      monthlyFee: 65,    // USD/mes
      maxMembers: 5,     // titular + 4 acompañantes
      graceDays: 5,
      isActive: true,
    },
    {
      name: 'Coworking',
      description: 'Acceso a áreas comunes, internet, 15 impresiones/mes, llamadas locales. 1 invitado/día.',
      entryFee: 0,
      monthlyFee: 86,
      maxMembers: 1,
      graceDays: 5,
      isActive: true,
    },
    {
      name: 'Classic',
      description: 'Domicilio comercial, 2 invitados/día, 25 impresiones, 10h salas/mes, recepción paquetería.',
      entryFee: 0,
      monthlyFee: 129,
      maxMembers: 1,
      graceDays: 5,
      isActive: true,
    },
    {
      name: 'Black',
      description: '1 titular + 1 cotitular, 4 invitados/día, 50 impresiones, 15h salas/mes, domicilio comercial.',
      entryFee: 0,
      monthlyFee: 194,
      maxMembers: 2,
      graceDays: 5,
      isActive: true,
    },
    {
      name: 'Platinum',
      description: '1 titular + 2 cotitulares, 6 invitados/día, 75 impresiones, 20h salas/mes, domicilio fiscal.',
      entryFee: 0,
      monthlyFee: 259,
      maxMembers: 3,
      graceDays: 5,
      isActive: true,
    },
    {
      name: 'Business',
      description: '1 titular + 3 cotitulares, 100 impresiones, 20h salas trad + 5h salas mega/mes, domicilio fiscal.',
      entryFee: 0,
      monthlyFee: 421,
      maxMembers: 4,
      graceDays: 5,
      isActive: true,
    },
  ];

  for (const mt of memTypes) {
    await upsert('membershipType',
      { companyId: cid, name: mt.name },
      { companyId: cid, ...mt }
    );
  }

  // ══════════════════════════════════════════════════════
  // SERVICIOS DEL POS (WorkaholicService)
  // Accesos individuales, paquetes y add-ons
  // ══════════════════════════════════════════════════════
  console.log('\n── Servicios del POS ──');
  const services = [
    // Accesos
    { name:'Day Pass',                    price:22,  cat:'ACCESO',   desc:'1 día en áreas comunes. Internet, café, 10 impresiones B/N.' },
    { name:'Passport (Day Pass + Sala + Alimento)', price:35, cat:'ACCESO', desc:'Day pass + 1h Terraza + 1 alimento del Menú Passport + soda.' },
    // Salas por hora (sin membresía)
    { name:'Terraza / Sala B — 1h',       price:44,  cat:'SALA',     desc:'Sala hasta 10 personas. Coffee break para 5, pantalla, pizarrón.' },
    { name:'Sala A — 1h',                 price:87,  cat:'SALA',     desc:'Sala hasta 20 personas. Coffee break para 10, pantalla, pizarrón.' },
    { name:'Sala Capacitaciones — 1h',    price:146, cat:'SALA',     desc:'Hasta 30 personas. Proyector, coffee break 10 personas.' },
    { name:'Auditorio — 1h',              price:200, cat:'SALA',     desc:'Hasta 60 personas. Proyector+bocinas+micrófono, coffee break 15 personas.' },
    // Renta de pala
    { name:'Impresión B/N (hoja)',        price:1,   cat:'SERVICIO', desc:'Impresión o copia en blanco y negro.' },
    { name:'Impresión Color (hoja)',       price:3,   cat:'SERVICIO', desc:'Impresión a color.' },
    { name:'Escaneo',                     price:1,   cat:'SERVICIO', desc:'Escaneo de documento.' },
    // Cafetería — productos frecuentes (precios en MXN)
    { name:'Coca-Cola / Sprite / Crush',  price:33,  cat:'CAFETERIA', desc:'Soda en lata o botella. Incluye versiones zero.' },
    { name:'Café Americano / Espresso',   price:50,  cat:'CAFETERIA', desc:'Café artesanal.' },
    { name:'Agua Embotellada',            price:20,  cat:'CAFETERIA', desc:'Agua natural, mineral o alcalina.' },
    { name:'Snack / Botana',             price:45,  cat:'CAFETERIA', desc:'Carne seca, Sun Chips, nueces, etc.' },
    // Alimentos frecuentes (Lonche — precios en MXN)
    { name:'Huevo con salchicha',         price:169, cat:'ALIMENTO',  desc:'Desayuno completo.' },
    { name:'Omelette con tocino',         price:169, cat:'ALIMENTO',  desc:'Desayuno completo.' },
    { name:'Torta de milanesa',           price:169, cat:'ALIMENTO',  desc:'Torta clásica.' },
    { name:'Ensalada (César/Casino/Ranch/Chipotle)', price:169, cat:'ALIMENTO', desc:'Ensalada a elegir.' },
    { name:'Hamburguesa Bacon',           price:169, cat:'ALIMENTO',  desc:'Hamburguesa con tocino.' },
    { name:'Wrap (Ranch/Búfalo/César/Casino)', price:169, cat:'ALIMENTO', desc:'Wrap a elegir.' },
  ];

  // Check if WorkaholicService model exists
  for (const svc of services) {
    await upsert('workaholicService',
      { companyId: cid, name: svc.name },
      { companyId: cid, price: svc.price, category: svc.cat,
        description: svc.desc, isActive: true }
    );
  }

  console.log('\n✅ Seed Workaholic completado');
  console.log(`   ${spaces.length} espacios/salas`);
  console.log(`   ${memTypes.length} tipos de membresía`);
  console.log(`   ${services.length} servicios del POS`);
  await p.$disconnect();
}

main().catch(e => { console.error('❌', e.message); p.$disconnect(); process.exit(1); });
