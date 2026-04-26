// node add-phase2-tables.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS approval_requests (
      id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, type TEXT NOT NULL,
      "entityId" TEXT, "entityType" TEXT, "requestedById" TEXT NOT NULL,
      "requestedByRole" TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'PENDIENTE',
      "currentStep" INT NOT NULL DEFAULT 1, priority TEXT NOT NULL DEFAULT 'NORMAL',
      "dueAt" TIMESTAMP, metadata JSONB, "rejectedReason" TEXT, "cancelReason" TEXT,
      "approvedAt" TIMESTAMP, "rejectedAt" TIMESTAMP, "cancelledAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS approval_steps (
      id TEXT PRIMARY KEY, "requestId" TEXT NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
      "stepOrder" INT NOT NULL, "stepType" TEXT NOT NULL DEFAULT 'SEQUENTIAL',
      "roleRequired" TEXT NOT NULL, "approverId" TEXT, "delegateApproverId" TEXT,
      status TEXT NOT NULL DEFAULT 'PENDIENTE', comment TEXT, "actedAt" TIMESTAMP,
      "dueAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "userId" TEXT NOT NULL,
      type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
      "actionUrl" TEXT, priority TEXT NOT NULL DEFAULT 'NORMAL',
      "sourceModule" TEXT, "sourceId" TEXT, channel TEXT NOT NULL DEFAULT 'IN_APP',
      read BOOLEAN NOT NULL DEFAULT FALSE, "readAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS hr_incidents (
      id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "employeeId" TEXT NOT NULL,
      type TEXT NOT NULL, "dateFrom" DATE NOT NULL, "dateTo" DATE NOT NULL,
      date DATE, quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'DIAS', amount DECIMAL(12,2),
      "taxableAmount" DECIMAL(12,2), "nonTaxableAmount" DECIMAL(12,2),
      "calculationMode" TEXT NOT NULL DEFAULT 'DAILY', "conceptCode" TEXT,
      "affectsPayroll" BOOLEAN NOT NULL DEFAULT TRUE,
      "affectsAttendance" BOOLEAN NOT NULL DEFAULT TRUE,
      "payrollPeriodId" TEXT, "appliedInPayrollId" TEXT,
      "sourceModule" TEXT, "sourceId" TEXT, "approvalRequestId" TEXT,
      "approvedByManagerId" TEXT, "approvedByHrId" TEXT, "evidenceUrl" TEXT,
      status TEXT NOT NULL DEFAULT 'PENDIENTE', notes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS disabilities (
      id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "employeeId" TEXT NOT NULL,
      type TEXT NOT NULL, "startDate" DATE NOT NULL, "endDate" DATE NOT NULL,
      days INT NOT NULL, folio TEXT, "documentUrl" TEXT,
      "subsidioIMSS" DECIMAL(12,2), "pagoPatronal" DECIMAL(12,2),
      "approvalRequestId" TEXT, "hrIncidentId" TEXT,
      status TEXT NOT NULL DEFAULT 'REGISTRADA', notes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS employee_terminations (
      id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "employeeId" TEXT NOT NULL,
      type TEXT NOT NULL, reason TEXT, "terminationDate" DATE NOT NULL,
      "lastWorkDay" DATE NOT NULL, "notificationDate" DATE, "documentsDate" DATE,
      "paymentDate" DATE, "accessRevokedAt" TIMESTAMP,
      "diasLaborados" INT, "vacacionesPendientes" DECIMAL(10,2),
      "partesProporcionales" DECIMAL(12,2), "primaAntiguedad" DECIMAL(12,2),
      indemnizacion DECIMAL(12,2), "totalFiniquito" DECIMAL(12,2),
      "checklistEquipo" BOOLEAN DEFAULT FALSE, "checklistUniformes" BOOLEAN DEFAULT FALSE,
      "checklistAccesos" BOOLEAN DEFAULT FALSE, "checklistDocumentos" BOOLEAN DEFAULT FALSE,
      "checklistAdeudos" BOOLEAN DEFAULT FALSE, "approvalRequestId" TEXT,
      status TEXT NOT NULL DEFAULT 'BORRADOR', notes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS legal_documents (
      id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "employeeId" TEXT,
      "terminationId" TEXT, "templateId" TEXT, type TEXT NOT NULL,
      "documentNumber" TEXT, title TEXT NOT NULL, content JSONB,
      "pdfUrl" TEXT, "fileHash" TEXT, version INT NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'BORRADOR', "generatedAt" TIMESTAMP,
      "generatedById" TEXT, "signedByEmployeeAt" TIMESTAMP,
      "signedByCompanyAt" TIMESTAMP, "signedById" TEXT, notes TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS payroll_receipts (
      id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL,
      "payrollPeriodId" TEXT NOT NULL, "employeeId" TEXT NOT NULL,
      "grossAmount" DECIMAL(12,2) NOT NULL, deductions DECIMAL(12,2) NOT NULL,
      "netAmount" DECIMAL(12,2) NOT NULL, breakdown JSONB NOT NULL DEFAULT '{}',
      "pdfUrl" TEXT, "fileHash" TEXT, "generatedById" TEXT,
      "publishedAt" TIMESTAMP, "employeeAckAt" TIMESTAMP,
      "deliveryMethod" TEXT NOT NULL DEFAULT 'IN_APP',
      status TEXT NOT NULL DEFAULT 'BORRADOR',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS rol_permisos (
      id TEXT PRIMARY KEY, "roleCode" TEXT NOT NULL, module TEXT NOT NULL,
      action TEXT NOT NULL, allowed BOOLEAN NOT NULL DEFAULT TRUE,
      "companyId" TEXT, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`,
  ];

  for (const sql of tables) {
    const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ ${name}`);
    } catch(e) {
      console.error(`❌ ${name}: ${e.message}`);
    }
  }

  console.log('\n✅ Todas las tablas listas');
}

main().catch(console.error).finally(() => prisma.$disconnect());

// Workaholic tables
const workahoticTables = [
  `CREATE TABLE IF NOT EXISTS workaholic_spaces (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, name TEXT NOT NULL,
    type TEXT NOT NULL, capacity INT NOT NULL DEFAULT 1, floor TEXT,
    amenities JSONB, "pricePerHour" DECIMAL(12,2), "pricePerDay" DECIMAL(12,2),
    "pricePerMonth" DECIMAL(12,2), "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS workaholic_membership_types (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, name TEXT NOT NULL,
    description TEXT, type TEXT NOT NULL, duration TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL, "hoursIncluded" INT NOT NULL DEFAULT 0,
    "accessDays" TEXT NOT NULL DEFAULT 'LUNES-VIERNES', "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS workaholic_memberships (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "membershipTypeId" TEXT NOT NULL,
    folio TEXT NOT NULL, "holderName" TEXT NOT NULL, "holderEmail" TEXT, "holderPhone" TEXT,
    "holderRfc" TEXT, "companyName" TEXT, "startDate" DATE NOT NULL, "endDate" DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVA', "hoursUsed" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "autoRenew" BOOLEAN NOT NULL DEFAULT FALSE, "paymentMethod" TEXT NOT NULL DEFAULT 'TRANSFERENCIA',
    notes TEXT, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS workaholic_reservations (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "spaceId" TEXT NOT NULL,
    "membershipId" TEXT, "clientName" TEXT NOT NULL, "clientEmail" TEXT, "clientPhone" TEXT,
    "clientCompany" TEXT, date DATE NOT NULL, "startTime" TEXT NOT NULL, "endTime" TEXT NOT NULL,
    hours DECIMAL(5,2) NOT NULL, "unitPrice" DECIMAL(12,2) NOT NULL, total DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'EFECTIVO', "fromMembership" BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'CONFIRMADA', notes TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS workaholic_payments (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "membershipId" TEXT NOT NULL,
    concept TEXT NOT NULL, amount DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'TRANSFERENCIA', reference TEXT,
    period TEXT, "paidAt" TIMESTAMP NOT NULL DEFAULT NOW(), status TEXT NOT NULL DEFAULT 'PAGADO'
  )`,
  // Lonche tables
  `CREATE TABLE IF NOT EXISTS lonche_products (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, sku TEXT NOT NULL,
    name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'OTRO',
    price DECIMAL(10,2) NOT NULL, cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cashbackPct" DECIMAL(5,2) NOT NULL DEFAULT 0, stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    "imageUrl" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_turnos (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "cajeroId" TEXT NOT NULL,
    "cajeroName" TEXT NOT NULL, date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'ABIERTO',
    "efectivoDeclarado" DECIMAL(12,2), "efectivoSistema" DECIMAL(12,2), diferencia DECIMAL(12,2),
    "notasCierre" TEXT, "validadoPor" TEXT, "validadoAt" TIMESTAMP,
    "aperturaAt" TIMESTAMP NOT NULL DEFAULT NOW(), "cierreAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_surtidos (
    id TEXT PRIMARY KEY, "turnoId" TEXT NOT NULL, "companyId" TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INICIAL', notes TEXT, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "createdById" TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_surtido_items (
    id TEXT PRIMARY KEY, "surtidoId" TEXT NOT NULL, "productId" TEXT NOT NULL,
    qty DECIMAL(10,2) NOT NULL, "costUnit" DECIMAL(10,2) NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_sales (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "turnoId" TEXT NOT NULL,
    "studentId" TEXT, "studentName" TEXT, "paymentMethod" TEXT NOT NULL DEFAULT 'EFECTIVO',
    total DECIMAL(12,2) NOT NULL, "cashbackEarned" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "prepagoPaid" DECIMAL(12,2) NOT NULL DEFAULT 0, "efectivoPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_sale_items (
    id TEXT PRIMARY KEY, "saleId" TEXT NOT NULL, "productId" TEXT NOT NULL,
    name TEXT NOT NULL, qty DECIMAL(10,2) NOT NULL, price DECIMAL(10,2) NOT NULL,
    cashback DECIMAL(10,2) NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_students (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, code TEXT NOT NULL,
    name TEXT NOT NULL, grade TEXT, "tutorName" TEXT, "tutorEmail" TEXT, "tutorPhone" TEXT,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0, cashback DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dailyLimit" DECIMAL(10,2), "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_recharges (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL, "paymentMethod" TEXT NOT NULL DEFAULT 'EFECTIVO',
    reference TEXT, "rechargedById" TEXT, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS lonche_transactions (
    id TEXT PRIMARY KEY, "companyId" TEXT NOT NULL, "studentId" TEXT NOT NULL,
    type TEXT NOT NULL, amount DECIMAL(12,2) NOT NULL, balance DECIMAL(12,2) NOT NULL,
    "saleId" TEXT, notes TEXT, "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
];

async function addTables() {
  const { PrismaClient: PC } = require('@prisma/client');
  const p = new PC();
  for (const sql of workahoticTables) {
    const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    try {
      await p.$executeRawUnsafe(sql);
      console.log(`✅ ${name}`);
    } catch(e) { console.error(`❌ ${name}: ${e.message}`); }
  }
  await p.$disconnect();
}
addTables().catch(console.error);

// Sprint C migration
const sprintCSQL = `
-- Sprint C: Nómina split timbrado/efectivo + Vacaciones avanzadas
ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "netTimbrado" DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "netEfectivo" DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "baseTimbrado" DECIMAL(12,2) DEFAULT 0;
ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS "baseEfectivo" DECIMAL(12,2) DEFAULT 0;

ALTER TABLE employees ADD COLUMN IF NOT EXISTS "splitMode" VARCHAR DEFAULT 'TOTAL_TIMBRADO';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "montoFijoTimbrado" DECIMAL(12,2);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS "pctTimbrado" DECIMAL(5,2);

ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "paymentType" VARCHAR DEFAULT 'GOZAR';
ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "pagoRegistrado" BOOLEAN DEFAULT FALSE;
ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "gozadaAt" TIMESTAMP;
ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "plazoGozar" TIMESTAMP;
ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoTimbrado" DECIMAL(12,2);
ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoEfectivo" DECIMAL(12,2);
ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "montoPrima" DECIMAL(12,2);
`;
async function runSprintC() {
  const { PrismaClient: PC } = require('@prisma/client');
  const p = new PC();
  try {
    await p.$executeRawUnsafe(sprintCSQL);
    console.log('✅ Sprint C: nomina split + vacaciones avanzadas');
  } catch(e) { console.error('Sprint C:', e.message); }
  await p.$disconnect();
}
runSprintC().catch(console.error);

// company_roles table for custom roles per company
async function addCompanyRoles() {
  const { PrismaClient: PC } = require('@prisma/client');
  const p = new PC();
  try {
    await p.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS company_roles (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        color TEXT NOT NULL DEFAULT '#64748b',
        description TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("companyId", code)
      )
    `);
    console.log('✅ company_roles');
  } catch(e) { console.error('company_roles:', e.message); }
  await p.$disconnect();
}
addCompanyRoles().catch(console.error);

// Fix rol_permisos - ensure companyId column exists (was nullable before)
async function fixRolPermisos() {
  const { PrismaClient: PC } = require('@prisma/client');
  const p = new PC();
  try {
    await p.$executeRawUnsafe(`
      ALTER TABLE rol_permisos ADD COLUMN IF NOT EXISTS "companyId" TEXT;
    `);
    console.log('✅ rol_permisos companyId ensured');
  } catch(e) { console.error('rol_permisos fix:', e.message); }
  await p.$disconnect();
}
fixRolPermisos().catch(console.error);

// Add IVA fields to sales, period_closures table
async function addIvaAndPeriodClosures() {
  const { PrismaClient: PC } = require('@prisma/client');
  const p = new PC();
  try {
    await p.$executeRawUnsafe(`
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0;
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS tax DECIMAL(12,2) DEFAULT 0;
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT;
      CREATE TABLE IF NOT EXISTS period_closures (
        id TEXT PRIMARY KEY,
        "companyId" TEXT NOT NULL,
        period TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ABIERTO',
        "closedBy" TEXT,
        "closedAt" TIMESTAMP,
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("companyId", period)
      );
      ALTER TABLE payroll_lines ADD COLUMN IF NOT EXISTS bonus DECIMAL(12,2) DEFAULT 0;
    `);
    console.log('✅ sales IVA fields + period_closures + payroll bonus');
  } catch(e) { console.error('sales_iva:', e.message); }
  await p.$disconnect();
}
addIvaAndPeriodClosures(); // sales_iva

async function addIntercompanyFields() {
  const { PrismaClient: PC } = require('@prisma/client');
  const p = new PC();
  try {
    await p.$executeRawUnsafe(`
      ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "fromCashAccountId" TEXT;
      ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "toCashAccountId" TEXT;
      ALTER TABLE intercompany_transfers ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT;
    `);
    console.log('✅ intercompany_transfers: cash account fields added');
  } catch(e) { console.error('intercompany fields:', e.message); }
  await p.$disconnect();
}
addIntercompanyFields().catch(console.error);
