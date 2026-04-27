-- Hotfix de sincronización DB ↔ Prisma
-- Corrige columnas que el Prisma Client ya espera, pero que no existen en la BD productiva.
-- Seguro para producción: usa IF NOT EXISTS y no elimina datos.

-- Intercompany: el servicio ya genera/consulta folio de trazabilidad.
ALTER TABLE "intercompany_transfers"
ADD COLUMN IF NOT EXISTS "folio" TEXT;

-- Ventas/POS: el modelo Sale y reportes consultan subtotal.
ALTER TABLE "sales"
ADD COLUMN IF NOT EXISTS "subtotal" NUMERIC(12,2) DEFAULT 0;

-- Columnas comunes de ventas que pueden existir en Prisma y faltar en BD según versiones previas.
ALTER TABLE "sales"
ADD COLUMN IF NOT EXISTS "discount" NUMERIC(12,2) DEFAULT 0;

ALTER TABLE "sales"
ADD COLUMN IF NOT EXISTS "tax" NUMERIC(12,2) DEFAULT 0;

ALTER TABLE "sales"
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'MXN';

ALTER TABLE "sales"
ADD COLUMN IF NOT EXISTS "exchangeRate" NUMERIC(10,4) DEFAULT 1;

ALTER TABLE "sales"
ADD COLUMN IF NOT EXISTS "totalMxn" NUMERIC(12,2) DEFAULT 0;

-- Rellenos razonables para evitar nulls en reportes existentes.
UPDATE "sales"
SET "subtotal" = COALESCE("subtotal", "total", 0)
WHERE "subtotal" IS NULL;

UPDATE "sales"
SET "totalMxn" = COALESCE("totalMxn", "total", 0)
WHERE "totalMxn" IS NULL;
