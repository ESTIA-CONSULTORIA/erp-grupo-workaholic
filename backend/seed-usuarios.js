// seed-usuarios.js — usa el mismo createUser del backend
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

const PASSWORD = 'Workaholic2026!';

const USUARIOS = [
  { name:'Julia Patricia Alvarado',      email:'conta.cpalestra@gmail.com',          roleCode:'contador'  },
  { name:'Kassandra Leon',               email:'kassandra.leon@grupoworkaholic.com',  roleCode:'contador'  },
  { name:'Carolina Moreno',              email:'carolina.moreno@grupoworkaholic.com', roleCode:'gerente'   },
  { name:'Jesus XX',                     email:'jesus@grupoworkaholic.com',           roleCode:'rh'        },
  { name:'Mayte XX',                     email:'mayte@grupoworkaholic.com',           roleCode:'rh'        },
  { name:'Gerardo XX',                   email:'gerardo@grupoworkaholic.com',         roleCode:'rh'        },
  { name:'Jose Miguel De Leon Sanchez',  email:'miguel.deleon@grupoworkaholic.com',   roleCode:'director'  },
  { name:'Miguel Angel Lora Lora',       email:'loraloraangel@gmail.com',             roleCode:'admin'     },
  { name:'Cecilia Ciaferoni',            email:'cecilia@grupoworkaholic.com',         roleCode:'gerente'   },
  { name:'Carlos Garnica',               email:'carlos.garnica@grupoworkaholic.com',  roleCode:'gerente'   },
];

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 10);
  const companies = await p.company.findMany({ select: { id:true, name:true } });
  console.log(`\nEmpresas: ${companies.map(c=>c.name).join(' | ')}\n`);

  let created=0, existing=0, errors=0;

  for (const u of USUARIOS) {
    try {
      // Buscar o crear rol
      let role = await p.role.findUnique({ where: { code: u.roleCode } });
      if (!role) {
        role = await p.role.create({
          data: { code: u.roleCode, name: u.roleCode, description: u.roleCode }
        });
      }

      // Buscar o crear usuario
      let user = await p.user.findUnique({ where: { email: u.email } });
      if (!user) {
        user = await p.user.create({
          data: { name: u.name, email: u.email, passwordHash: hash, isActive: true }
        });
        console.log(`✅ ${u.name}`);
        created++;
      } else {
        console.log(`↺  ${u.name} (ya existe)`);
        existing++;
      }

      // Asignar a TODAS las empresas
      for (const c of companies) {
        const has = await p.userCompanyRole.findFirst({
          where: { userId: user.id, companyId: c.id }
        });
        if (!has) {
          await p.userCompanyRole.create({
            data: { userId: user.id, companyId: c.id, roleId: role.id }
          });
        }
      }

    } catch(e) {
      console.error(`❌ ${u.name}: ${e.message}`);
      errors++;
    }
  }

  console.log(`\n── Resultado ──`);
  console.log(`✅ Creados:  ${created}`);
  console.log(`↺  Existían: ${existing}`);
  console.log(`❌ Errores:  ${errors}`);
  console.log(`\nContraseña: ${PASSWORD}`);
  await p.$disconnect();
}

main().catch(e => { console.error(e.message); p.$disconnect(); process.exit(1); });
