import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Creando usuarios...');

  // Obtener empresas
  const machete  = await prisma.company.findUnique({ where: { code: 'MACHETE'  } });
  const worka    = await prisma.company.findUnique({ where: { code: 'WORKA'    } });
  const palestra = await prisma.company.findUnique({ where: { code: 'PALESTRA' } });
  const lonche   = await prisma.company.findUnique({ where: { code: 'LONCHE'   } });

  if (!machete || !worka || !palestra || !lonche) {
    throw new Error('Empresas no encontradas. Ejecuta el seed principal primero.');
  }

  // Obtener roles existentes
  const roles: Record<string, any> = {};
  const roleList = await prisma.role.findMany();
  for (const r of roleList) { roles[r.code] = r; }

  // Crear rol director si no existe
  if (!roles['director']) {
    roles['director'] = await prisma.role.upsert({
      where: { code: 'director' },
      update: {},
      create: { code: 'director', name: 'Director General', description: 'Solo lectura, acceso a todo' },
    });
    console.log('✅ Rol director creado');
  }

  // Crear rol administrador si no existe
  if (!roles['administrador']) {
    roles['administrador'] = await prisma.role.upsert({
      where: { code: 'administrador' },
      update: {},
      create: { code: 'administrador', name: 'Administrador', description: 'Acceso total' },
    });
    console.log('✅ Rol administrador creado');
  }

  const todasEmpresas = [machete, worka, palestra, lonche];

  const usuarios = [
    {
      name: 'Carolina Moreno',
      email: 'carolina@grupoworkaholic.com',
      password: 'supworka2026@',
      empresas: todasEmpresas,
      rol: 'gerente',
    },
    {
      name: 'Julia Alvarado',
      email: 'julia@grupoworkaholic.com',
      password: 'userpalestra2026@',
      empresas: [palestra],
      rol: 'contador',
    },
    {
      name: 'Kasandra Leon',
      email: 'kasandra@grupoworkaholic.com',
      password: 'userworka2026@',
      empresas: [worka],
      rol: 'contador',
    },
    {
      name: 'Jaen Plaza',
      email: 'jaen@grupoworkaholic.com',
      password: 'userlonche2026@',
      empresas: [lonche, palestra],
      rol: 'contador',
    },
    {
      name: 'Wendy Diaz',
      email: 'wendy@grupoworkaholic.com',
      password: 'usermachete2026@',
      empresas: [machete],
      rol: 'contador',
    },
    {
      name: 'Lucia',
      email: 'lucia@grupoworkaholic.com',
      password: 'cajama26@',
      empresas: [machete],
      rol: 'cajero',
    },
    {
      name: 'Mayte',
      email: 'mayte@grupoworkaholic.com',
      password: 'rhall26@',
      empresas: todasEmpresas,
      rol: 'rh',
    },
    {
      name: 'Jesus',
      email: 'jesus@grupoworkaholic.com',
      password: 'rhall27@',
      empresas: todasEmpresas,
      rol: 'rh',
    },
    {
      name: 'Gerardo',
      email: 'gerardo@grupoworkaholic.com',
      password: 'rhall28@',
      empresas: todasEmpresas,
      rol: 'rh',
    },
    {
      name: 'Miguel de Leon',
      email: 'miguel@iconos.mx',
      password: 'boos26@',
      empresas: todasEmpresas,
      rol: 'director',
    },
    {
      name: 'Miguel Lora',
      email: 'loraloraangel@gmail.com',
      password: 'admin2026@',
      empresas: todasEmpresas,
      rol: 'administrador',
    },
  ];

  for (const u of usuarios) {
    const passwordHash = await bcrypt.hash(u.password, 10);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name },
      create: { email: u.email, name: u.name, passwordHash, isActive: true },
    });

    const role = roles[u.rol];
    if (!role) { console.log(`⚠ Rol ${u.rol} no encontrado para ${u.name}`); continue; }

    for (const empresa of u.empresas) {
      if (!empresa) continue;
      await prisma.userCompanyRole.upsert({
        where: { userId_companyId: { userId: user.id, companyId: empresa.id } },
        update: { roleId: role.id },
        create: { userId: user.id, companyId: empresa.id, roleId: role.id },
      });
    }

    console.log(`✅ ${u.name} — ${u.rol} — ${u.empresas.map((e:any) => e.code).join(', ')}`);
  }

  console.log('\n🎉 Todos los usuarios creados!');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
