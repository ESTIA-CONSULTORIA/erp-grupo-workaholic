// check-users.js — muestra todos los usuarios y sus roles por empresa
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const companies = await p.company.findMany({ select: { id:true, name:true } });

  for (const co of companies) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`  ${co.name}`);
    console.log(`${'═'.repeat(50)}`);

    const userRoles = await p.userCompanyRole.findMany({
      where: { companyId: co.id },
      include: {
        user: { select: { name:true, email:true, isActive:true } },
        role: { select: { code:true, name:true } },
      },
      orderBy: { user: { name: 'asc' } },
    });

    if (userRoles.length === 0) {
      console.log('  (sin usuarios)');
    } else {
      for (const ur of userRoles) {
        const status = ur.user.isActive ? '✅' : '❌ SUSPENDIDO';
        console.log(`  ${status} ${ur.user.name} — ${ur.role.code} — ${ur.user.email}`);
      }
    }
  }

  // También mostrar roles existentes
  console.log(`\n${'═'.repeat(50)}`);
  console.log('  ROLES en la BD');
  console.log(`${'═'.repeat(50)}`);
  const roles = await p.role.findMany({ orderBy: { code: 'asc' } });
  for (const r of roles) {
    console.log(`  ${r.code} — ${r.name}`);
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e.message); p.$disconnect(); });
