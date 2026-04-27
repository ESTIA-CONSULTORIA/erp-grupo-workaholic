-- Arqueo del contador: declaración vs realidad del sistema.
-- Módulo separado de Corte de Caja.

CREATE TABLE IF NOT EXISTS "contador_arqueos" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT,
  "folio" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "declaredJson" JSONB NOT NULL,
  "systemJson" JSONB NOT NULL,
  "summaryJson" JSONB NOT NULL,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ENVIADO',
  "differenceVisibleAt" TIMESTAMP(3) NOT NULL,
  "reviewedById" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "contador_arqueos_companyId_folio_key"
ON "contador_arqueos"("companyId", "folio");

CREATE INDEX IF NOT EXISTS "contador_arqueos_companyId_date_idx"
ON "contador_arqueos"("companyId", "date");

CREATE INDEX IF NOT EXISTS "contador_arqueos_status_idx"
ON "contador_arqueos"("status");
