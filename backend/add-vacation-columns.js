// node add-vacation-columns.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cols = [
    `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "businessDays" INTEGER`,
    `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "primaVacacional" DECIMAL(10,2)`,
    `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "conGoce" BOOLEAN DEFAULT TRUE`,
    `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "requestedById" TEXT`,
    `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "approvedByJefe" TEXT`,
    `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "approvedByRH" TEXT`,
    `ALTER TABLE vacation_requests ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT`,
  ];

  for (const sql of cols) {
    try {
      await prisma.$executeRawUnsafe(sql);
      const col = sql.match(/ADD COLUMN IF NOT EXISTS "(\w+)"/)?.[1];
      console.log(`✅ ${col}`);
    } catch(e) {
      console.error(`❌ ${e.message}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
