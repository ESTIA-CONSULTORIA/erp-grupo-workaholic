
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const PASSWORD = 'Workaholic2026!';
  const hash = await bcrypt.hash(PASSWORD, 10);

  // Get all companies
  const companies = await prisma.company.findMany({ select: { id:true, code:true, name:true } });
  console.log('Companies:', companies.map(c => c.code+':'+c.id));

  const byCode = Object.fromEntries(companies.map(c => [c.code, c.id]));

  // Get roles
  const roles = await prisma.role.findMany({ select: { id:true, code:true } });
  const roleByCode = Object.fromEntries(roles.map(r => [r.code, r.id]));
  console.log('Roles:', Object.keys(roleByCode));

  const getOrCreateRole = async (code, name) => {
    let r = await prisma.role.findUnique({ where: { code } });
    if (!r) r = await prisma.role.create({ data: { code, name, description: name } });
    return r.id;
  };

  const createUser = async (name, email, roleCode, companyIds) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { console.log('Already exists:', email); return existing; }
    const roleId = await getOrCreateRole(roleCode, roleCode);
    const user = await prisma.user.create({ data: { name, email, passwordHash: hash, isActive: true } });
    for (const cid of companyIds) {
      if (cid) await prisma.userCompanyRole.create({ data: { userId: user.id, companyId: cid, roleId } });
    }
    console.log('Created:', email);
    return user;
  };

  // Cajeros/operadores pendientes por empresa
  const W = byCode['WORKAHOLIC'];
  const P = byCode['PALESTRA'];
  const L = byCode['LONCHE'];
  const M = byCode['MACHETE'];
  const ALL = [M, W, P, L].filter(Boolean);

  // Usuarios ya existentes (del resumen): admin, carolina, julia, kasandra, jaen, wendy, lucia, mayte, jesus, gerardo, miguel de leon, miguel lora
  // Pendientes: cajeros/operadores para Workaholic, Palestra, Lonche
  if (W) await createUser('Cajero Workaholic', 'cajero@workaholic.com', 'cajero', [W]);
  if (P) await createUser('Cajero Palestra',   'cajero@palestra.com',   'cajero', [P]);
  if (L) await createUser('Cajero Lonche',     'cajero@lonche.com',     'cajero', [L]);

  // Gerentes por empresa si no existen
  if (W) await createUser('Gerente Workaholic', 'gerente@workaholic.com', 'gerente', [W]);
  if (P) await createUser('Gerente Palestra',   'gerente@palestra.com',   'gerente', [P]);
  if (L) await createUser('Gerente Lonche',     'gerente@lonche.com',     'gerente', [L]);
}

main().catch(console.error).finally(() => prisma.$disconnect());
