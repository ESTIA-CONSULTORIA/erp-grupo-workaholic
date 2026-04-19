// Corre esto: node add-userid-column.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`ALTER TABLE employees ADD COLUMN IF NOT EXISTS "userId" TEXT`;
    console.log('✅ Columna userId agregada');
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS employees_userId_key ON employees("userId")`;
    console.log('✅ Índice único creado');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
