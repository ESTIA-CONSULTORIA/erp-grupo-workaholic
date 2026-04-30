
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const companies = await p.company.findMany({ select: { id:true, name:true, code:true } });
  console.log(JSON.stringify(companies, null, 2));
  await p.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
