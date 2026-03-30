// backend/prisma/seed.ts
// Datos iniciales del sistema
// Ejecutar: npx prisma db seed

import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // ── PERMISOS ──────────────────────────────────────────────
  const permisos = [
    { code: 'ver_dashboard',             name: 'Ver dashboard' },
    { code: 'capturar_cortes',           name: 'Capturar cortes' },
    { code: 'aprobar_cortes',            name: 'Aprobar cortes' },
    { code: 'capturar_gastos',           name: 'Capturar gastos' },
    { code: 'aprobar_gastos',            name: 'Aprobar gastos' },
    { code: 'capturar_compras',          name: 'Capturar compras' },
    { code: 'administrar_cxc',           name: 'Administrar CxC' },
    { code: 'administrar_cxp',           name: 'Administrar CxP' },
    { code: 'ver_reportes',              name: 'Ver reportes' },
    { code: 'cerrar_periodo',            name: 'Cerrar período' },
    { code: 'administrar_configuracion', name: 'Administrar configuración' },
    { code: 'ver_consolidado',           name: 'Ver dashboard consolidado' },
    { code: 'administrar_usuarios',      name: 'Administrar usuarios' },
    { code: 'pos_machete',               name: 'Usar POS Machete' },
    { code: 'produccion_machete',        name: 'Gestionar producción Machete' },
  ];

  for (const p of permisos) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }
  console.log('✅ Permisos creados');

  // ── ROLES ─────────────────────────────────────────────────
  const roles = [
    {
      code: 'admin',
      name: 'Administrador',
      description: 'Acceso total al sistema',
      permisos: permisos.map(p => p.code),
    },
    {
      code: 'gerente',
      name: 'Gerente / Dueño',
      description: 'Solo lectura: dashboard y reportes',
      permisos: ['ver_dashboard', 'ver_reportes', 'ver_consolidado'],
    },
    {
      code: 'contador',
      name: 'Contador',
      description: 'Reportes, cierre y configuración financiera',
      permisos: ['ver_dashboard', 'ver_reportes', 'cerrar_periodo', 'administrar_configuracion', 'administrar_cxc', 'administrar_cxp'],
    },
    {
      code: 'capturista',
      name: 'Capturista',
      description: 'Solo captura operativa',
      permisos: ['capturar_cortes', 'capturar_gastos', 'capturar_compras', 'ver_dashboard'],
    },
  ];

  for (const rol of roles) {
    const created = await prisma.role.upsert({
      where: { code: rol.code },
      update: {},
      create: { code: rol.code, name: rol.name, description: rol.description },
    });
    for (const pCode of rol.permisos) {
      const perm = await prisma.permission.findUnique({ where: { code: pCode } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: created.id, permissionId: perm.id } },
        update: {},
        create: { roleId: created.id, permissionId: perm.id },
      });
    }
  }
  console.log('✅ Roles creados');

  // ── USUARIO ADMIN ─────────────────────────────────────────
  const hash = await bcrypt.hash('Admin2026!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@grupoworkaholic.com' },
    update: {},
    create: {
      email: 'admin@grupoworkaholic.com',
      passwordHash: hash,
      name: 'Administrador',
      phone: '',
    },
  });
  console.log('✅ Usuario admin creado');

  // ── EMPRESAS ──────────────────────────────────────────────
  const empresas = [
    { code: 'machete',    name: 'Manjares Machete', color: '#B5451B', hasAB: false, hasProduction: true },
    { code: 'workaholic', name: 'Workaholic',        color: '#1F3864', hasAB: true,  hasProduction: false },
    { code: 'palestra',   name: 'Palestra',           color: '#2E7D32', hasAB: true,  hasProduction: false },
    { code: 'lonche',     name: 'Lonche',             color: '#6A1B9A', hasAB: true,  hasProduction: false },
  ];

  for (const emp of empresas) {
    const company = await prisma.company.upsert({
      where: { code: emp.code },
      update: {},
      create: emp,
    });

    // Asignar admin a todas las empresas
    const adminRole = await prisma.role.findUnique({ where: { code: 'admin' } });
    await prisma.userCompanyRole.upsert({
      where: { userId_companyId: { userId: adminUser.id, companyId: company.id } },
      update: {},
      create: { userId: adminUser.id, companyId: company.id, roleId: adminRole!.id },
    });
  }
  console.log('✅ Empresas creadas');

  // ── SUCURSALES ────────────────────────────────────────────
  const sucursales: Record<string, { code: string; name: string }[]> = {
    machete:    [{ code: 'unica',       name: 'Machete (única)' }],
    workaholic: [{ code: 'unica',       name: 'Workaholic (única)' }],
    palestra:   [{ code: 'unica',       name: 'Palestra (única)' }],
    lonche:     [
      { code: 'vizcaya',    name: 'Vizcaya' },
      { code: 'colegio',    name: 'Colegio' },
      { code: 'xochimilco', name: 'Xochimilco' },
      { code: 'compuertas', name: 'Compuertas' },
    ],
  };

  for (const [empCode, branches] of Object.entries(sucursales)) {
    const company = await prisma.company.findUnique({ where: { code: empCode } });
    if (!company) continue;
    for (const branch of branches) {
      await prisma.branch.upsert({
        where: { companyId_code: { companyId: company.id, code: branch.code } },
        update: {},
        create: { companyId: company.id, ...branch },
      });
    }
  }
  console.log('✅ Sucursales creadas');

  // ── CUENTAS DE FLUJO (por empresa) ───────────────────────
  const cuentasPorEmpresa = [
    { code: 'efectivo_mxn', name: 'Efectivo MXN',    type: 'EFECTIVO',    currency: 'MXN' },
    { code: 'efectivo_usd', name: 'Efectivo USD',    type: 'EFECTIVO',    currency: 'USD' },
    { code: 'banregio_mxn', name: 'BANREGIO MXN',    type: 'BANCO',       currency: 'MXN', bankName: 'BANREGIO' },
    { code: 'banregio_usd', name: 'BANREGIO USD',    type: 'BANCO',       currency: 'USD', bankName: 'BANREGIO' },
    { code: 'mercado_pago', name: 'Mercado Pago',    type: 'PLATAFORMA',  currency: 'MXN' },
    { code: 'stripe',       name: 'Stripe/Terminal', type: 'PLATAFORMA',  currency: 'MXN' },
  ];

  const companies = await prisma.company.findMany();
  for (const company of companies) {
    for (const cuenta of cuentasPorEmpresa) {
      await prisma.cashAccount.upsert({
        where: { companyId_code: { companyId: company.id, code: cuenta.code } },
        update: {},
        create: { companyId: company.id, ...cuenta },
      });
    }
  }
  console.log('✅ Cuentas de flujo creadas');

  // ── ESQUEMA FINANCIERO — PALESTRA (plantilla más completa) ─
  await seedEsquemaPalestra();
  await seedEsquemaWorkaholic();
  await seedEsquemaMachete();
  await seedEsquemaLonche();

  console.log('✅ Esquemas financieros creados');
  console.log('\n🎉 Seed completado exitosamente');
  console.log('📧 Admin: admin@grupoworkaholic.com');
  console.log('🔑 Password: Admin2026!');
}

// ── ESQUEMA PALESTRA ──────────────────────────────────────────
async function seedEsquemaPalestra() {
  const company = await prisma.company.findUnique({ where: { code: 'palestra' } });
  if (!company) return;

  const schema = await prisma.financialSchema.upsert({
    where: { companyId: company.id },
    update: {},
    create: { companyId: company.id, name: 'Esquema Palestra 2026' },
  });

  const secciones = [
    { code: 'INGRESOS',             name: 'Ingresos Venta',                order: 1,  affectsResult: true },
    { code: 'COSTO_VENTA',          name: 'Costo de Venta',                order: 2,  affectsResult: true },
    { code: 'GASTOS_GENERALES',     name: 'Gastos Generales',              order: 3,  affectsResult: true },
    { code: 'OBLIGACIONES',         name: 'Total de Obligaciones',         order: 4,  affectsResult: true },
    { code: 'OPERACIONES_EXTERNAS', name: 'Operaciones Externas al Negocio', order: 5, affectsResult: false },
    { code: 'COMPROBACION',         name: 'Comprobación',                  order: 6,  affectsResult: false },
  ];

  for (const sec of secciones) {
    await prisma.financialSection.upsert({
      where: { schemaId_code: { schemaId: schema.id, code: sec.code } },
      update: {},
      create: { schemaId: schema.id, ...sec },
    });
  }

  // Grupos y rubros de ingresos Palestra
  const secIngresos = await prisma.financialSection.findUnique({
    where: { schemaId_code: { schemaId: schema.id, code: 'INGRESOS' } },
  });

  const grupoIngresos = await prisma.financialGroup.upsert({
    where: { sectionId_code: { sectionId: secIngresos!.id, code: 'VENTA_TOTAL' } },
    update: {},
    create: { sectionId: secIngresos!.id, code: 'VENTA_TOTAL', name: 'Venta Total', order: 1, isSummary: true },
  });

  const rubrosIngPalestra = [
    { code: 'MEMBRESIAS',       name: 'Ingreso por Membresías y Mensualidad', order: 1,  allowsCxC: true, requiresClient: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'RENTA_CANCHAS',    name: 'Ingreso por Renta de Canchas',         order: 2,  allowsCxC: true, requiresClient: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'CLASES',           name: 'Ingreso por Clases',                   order: 3,  allowsCxC: true, requiresClient: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'ACADEMIAS',        name: 'Ingreso por Academias y Clínicas',     order: 4,  allowsCxC: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'RENTA_PALAS',      name: 'Ingreso por Renta de Palas',          order: 5,  affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'VENTA_PALAS',      name: 'Ingreso por Venta de Palas',          order: 6,  affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'TIENDA',           name: 'Ingresos en Tienda (Adidas/Palestra)', order: 7,  affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'AYB',              name: 'Ingreso por Alimentos y Bebidas',      order: 8,  affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'AYB_TIENDA',       name: 'Ingreso por Alimentos en Tienda',      order: 9,  affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'TORNEOS',          name: 'Ingreso por Torneos (Inscripciones)',  order: 10, allowsCxC: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'EVENTOS',          name: 'Ingreso por Eventos',                  order: 11, allowsCxC: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'MULTISPORT',       name: 'Ingreso Multisport',                   order: 12, allowsCxC: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'PUBLICIDAD',       name: 'Ingreso por Publicidad en Canchas',    order: 13, allowsCxC: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsCxC: true, affectsResult: true },
    { code: 'OTROS_INGRESOS',   name: 'Otros Ingresos',                       order: 14, allowsCxC: true, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'PATROCINIOS',      name: 'Patrocinios',                          order: 15, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'FUTBOL_ACADEMY',   name: 'Futbol Academy',                       order: 16, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'ESTACIONAMIENTO',  name: 'Estacionamiento',                      order: 17, affectsGrossSale: true, affectsNetSale: true, affectsFlow: true, affectsResult: true },
    { code: 'CORTESIAS',        name: 'Cortesías',                            order: 18, rubricType: 'CORTESIA', affectsGrossSale: false, affectsNetSale: false, affectsFlow: false, affectsResult: false, showInDashboard: false },
    { code: 'DESCUENTOS',       name: 'Descuentos',                           order: 19, rubricType: 'DESCUENTO', affectsGrossSale: false, affectsNetSale: true, affectsFlow: false, affectsResult: true, showInDashboard: false },
  ];

  for (const rubro of rubrosIngPalestra) {
    await prisma.financialRubric.upsert({
      where: { groupId_code: { groupId: grupoIngresos.id, code: rubro.code } },
      update: {},
      create: {
        groupId: grupoIngresos.id,
        rubricType: 'INGRESO',
        allowsContado: true,
        showInSummary: true,
        showInStatement: true,
        showInDashboard: true,
        ...rubro,
      },
    });
  }
}

// ── ESQUEMA WORKAHOLIC ────────────────────────────────────────
async function seedEsquemaWorkaholic() {
  const company = await prisma.company.findUnique({ where: { code: 'workaholic' } });
  if (!company) return;

  const schema = await prisma.financialSchema.upsert({
    where: { companyId: company.id },
    update: {},
    create: { companyId: company.id, name: 'Esquema Workaholic 2026' },
  });

  const secIngresos = await prisma.financialSection.upsert({
    where: { schemaId_code: { schemaId: schema.id, code: 'INGRESOS' } },
    update: {},
    create: { schemaId: schema.id, code: 'INGRESOS', name: 'Ingresos', order: 1, affectsResult: true },
  });

  const grupoIngW = await prisma.financialGroup.upsert({
    where: { sectionId_code: { sectionId: secIngresos.id, code: 'VENTA_TOTAL' } },
    update: {},
    create: { sectionId: secIngresos.id, code: 'VENTA_TOTAL', name: 'Venta Total', order: 1, isSummary: true },
  });

  const rubrosW = [
    { code: 'CAFETERIA',        name: 'Ingreso Cafetería',         order: 1, allowsCxC: true },
    { code: 'COCINA',           name: 'Ingreso Cocina',            order: 2, allowsCxC: true },
    { code: 'BARRA',            name: 'Ingreso Barra',             order: 3, allowsCxC: true },
    { code: 'RENTA_OFICINA',    name: 'Renta de Oficina',          order: 4, allowsCxC: true, requiresClient: true },
    { code: 'MEMBRESIAS',       name: 'Membresías',                order: 5, allowsCxC: true, requiresClient: true },
    { code: 'SALA_JUNTAS',      name: 'Paquete Sala de Juntas',    order: 6, allowsCxC: true },
    { code: 'ANTICIPOS',        name: 'Anticipos',                 order: 7, affectsFlow: true, affectsResult: false },
    { code: 'DEPOSITO_GARANTIA',name: 'Depósito en Garantía',      order: 8, affectsFlow: true, affectsResult: false },
    { code: 'EVENTOS',          name: 'Eventos',                   order: 9 },
    { code: 'OTROS',            name: 'Otros Ingresos',            order: 10 },
    { code: 'CORTESIAS',        name: 'Cortesías',                 order: 11, rubricType: 'CORTESIA', affectsGrossSale: false, affectsNetSale: false, affectsFlow: false, affectsResult: false },
  ];

  for (const rubro of rubrosW) {
    await prisma.financialRubric.upsert({
      where: { groupId_code: { groupId: grupoIngW.id, code: rubro.code } },
      update: {},
      create: {
        groupId: grupoIngW.id,
        rubricType: 'INGRESO',
        allowsContado: true,
        affectsGrossSale: true,
        affectsNetSale: true,
        affectsFlow: true,
        affectsCxC: rubro.allowsCxC ?? false,
        affectsResult: true,
        showInSummary: true,
        showInStatement: true,
        showInDashboard: true,
        ...rubro,
      },
    });
  }
}

// ── ESQUEMA MACHETE ───────────────────────────────────────────
async function seedEsquemaMachete() {
  const company = await prisma.company.findUnique({ where: { code: 'machete' } });
  if (!company) return;

  const schema = await prisma.financialSchema.upsert({
    where: { companyId: company.id },
    update: {},
    create: { companyId: company.id, name: 'Esquema Machete 2026' },
  });

  const secIngresos = await prisma.financialSection.upsert({
    where: { schemaId_code: { schemaId: schema.id, code: 'INGRESOS' } },
    update: {},
    create: { schemaId: schema.id, code: 'INGRESOS', name: 'Ingresos por Ventas', order: 1, affectsResult: true },
  });

  const grupoIngM = await prisma.financialGroup.upsert({
    where: { sectionId_code: { sectionId: secIngresos.id, code: 'VENTA_TOTAL' } },
    update: {},
    create: { sectionId: secIngresos.id, code: 'VENTA_TOTAL', name: 'Venta Total', order: 1, isSummary: true },
  });

  const rubrosM = [
    { code: 'MOSTRADOR',  name: 'Venta Mostrador', order: 1, allowsCxC: false },
    { code: 'MAYOREO',    name: 'Venta Mayoreo',   order: 2, allowsCxC: true, requiresClient: true },
    { code: 'ONLINE',     name: 'Venta Online',    order: 3, allowsCxC: false },
    { code: 'ML',         name: 'Mercado Libre',   order: 4, affectsFlow: true, affectsResult: true },
  ];

  for (const rubro of rubrosM) {
    await prisma.financialRubric.upsert({
      where: { groupId_code: { groupId: grupoIngM.id, code: rubro.code } },
      update: {},
      create: {
        groupId: grupoIngM.id,
        rubricType: 'INGRESO',
        allowsContado: true,
        affectsGrossSale: true,
        affectsNetSale: true,
        affectsFlow: true,
        affectsCxC: rubro.allowsCxC ?? false,
        affectsResult: true,
        showInSummary: true,
        showInStatement: true,
        showInDashboard: true,
        ...rubro,
      },
    });
  }
}

// ── ESQUEMA LONCHE ────────────────────────────────────────────
async function seedEsquemaLonche() {
  const company = await prisma.company.findUnique({ where: { code: 'lonche' } });
  if (!company) return;

  const schema = await prisma.financialSchema.upsert({
    where: { companyId: company.id },
    update: {},
    create: { companyId: company.id, name: 'Esquema Lonche 2026' },
  });

  const secIngresos = await prisma.financialSection.upsert({
    where: { schemaId_code: { schemaId: schema.id, code: 'INGRESOS' } },
    update: {},
    create: { schemaId: schema.id, code: 'INGRESOS', name: 'Ingresos', order: 1, affectsResult: true },
  });

  const grupoIngL = await prisma.financialGroup.upsert({
    where: { sectionId_code: { sectionId: secIngresos.id, code: 'VENTA_TOTAL' } },
    update: {},
    create: { sectionId: secIngresos.id, code: 'VENTA_TOTAL', name: 'Venta Total', order: 1, isSummary: true },
  });

  const rubrosL = [
    { code: 'CAFETERIA', name: 'Ingreso Cafetería',   order: 1, allowsCxC: true },
    { code: 'COCINA',    name: 'Ingreso Cocina',      order: 2, allowsCxC: true },
    { code: 'OTROS',     name: 'Otros Ingresos',      order: 3 },
    { code: 'CORTESIAS', name: 'Cortesías',           order: 4, rubricType: 'CORTESIA', affectsGrossSale: false, affectsNetSale: false, affectsFlow: false, affectsResult: false },
  ];

  for (const rubro of rubrosL) {
    await prisma.financialRubric.upsert({
      where: { groupId_code: { groupId: grupoIngL.id, code: rubro.code } },
      update: {},
      create: {
        groupId: grupoIngL.id,
        rubricType: 'INGRESO',
        allowsContado: true,
        affectsGrossSale: true,
        affectsNetSale: true,
        affectsFlow: true,
        affectsCxC: rubro.allowsCxC ?? false,
        affectsResult: true,
        showInSummary: true,
        showInStatement: true,
        showInDashboard: true,
        ...rubro,
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
