"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed...');
    const machete = await prisma.company.upsert({ where: { code: 'MACHETE' }, update: {}, create: { code: 'MACHETE', name: 'Manjares Machete', color: '#B5451B', hasProduction: true, isActive: true } });
    const worka = await prisma.company.upsert({ where: { code: 'WORKA' }, update: {}, create: { code: 'WORKA', name: 'Workaholic', color: '#3b82f6', isActive: true } });
    const palestra = await prisma.company.upsert({ where: { code: 'PALESTRA' }, update: {}, create: { code: 'PALESTRA', name: 'Palestra', color: '#10b981', isActive: true } });
    const lonche = await prisma.company.upsert({ where: { code: 'LONCHE' }, update: {}, create: { code: 'LONCHE', name: 'Lonche', color: '#f59e0b', isActive: true } });
    const companies = [machete, worka, palestra, lonche];
    console.log('✅ Empresas:', companies.map(c => c.name).join(', '));
    for (const c of companies) {
        await prisma.branch.upsert({
            where: { companyId_code: { companyId: c.id, code: 'MAIN' } },
            update: {},
            create: { companyId: c.id, code: 'MAIN', name: `${c.name} Principal`, isActive: true },
        });
    }
    console.log('✅ Sucursales creadas');
    const adminRole = await prisma.role.upsert({ where: { code: 'admin' }, update: {}, create: { code: 'admin', name: 'Administrador', description: 'Acceso total' } });
    await prisma.role.upsert({ where: { code: 'gerente' }, update: {}, create: { code: 'gerente', name: 'Gerente', description: 'Gerencia' } });
    await prisma.role.upsert({ where: { code: 'contador' }, update: {}, create: { code: 'contador', name: 'Contador', description: 'Contabilidad' } });
    await prisma.role.upsert({ where: { code: 'rh' }, update: {}, create: { code: 'rh', name: 'Recursos Humanos', description: 'RH' } });
    await prisma.role.upsert({ where: { code: 'cajero' }, update: {}, create: { code: 'cajero', name: 'Cajero', description: 'Caja' } });
    console.log('✅ Roles creados');
    const passwordHash = await bcrypt.hash('Admin2026!', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@grupoworkaholic.com' },
        update: {},
        create: { email: 'admin@grupoworkaholic.com', name: 'Administrador GW', passwordHash, isActive: true },
    });
    console.log('✅ Usuario admin:', admin.email);
    for (const c of companies) {
        await prisma.userCompanyRole.upsert({
            where: { userId_companyId: { userId: admin.id, companyId: c.id } },
            update: {},
            create: { userId: admin.id, companyId: c.id, roleId: adminRole.id },
        });
    }
    console.log('✅ Accesos configurados');
    for (const c of companies) {
        await prisma.cashAccount.upsert({ where: { companyId_code: { companyId: c.id, code: 'BBVA' } }, update: {}, create: { companyId: c.id, code: 'BBVA', name: 'BBVA Principal', type: 'BANCO', currency: 'MXN', bankName: 'BBVA', isActive: true } });
        await prisma.cashAccount.upsert({ where: { companyId_code: { companyId: c.id, code: 'CAJA' } }, update: {}, create: { companyId: c.id, code: 'CAJA', name: 'Caja chica', type: 'EFECTIVO', currency: 'MXN', isActive: true } });
    }
    console.log('✅ Cuentas bancarias creadas');
    console.log('\n🎉 Seed completado!');
    console.log('📧 admin@grupoworkaholic.com');
    console.log('🔑 Admin2026!');
}
main()
    .catch(e => { console.error('❌ Error:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map