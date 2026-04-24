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
