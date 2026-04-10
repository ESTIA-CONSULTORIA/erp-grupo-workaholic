"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🏦 Creando cuentas bancarias...');
    const companies = await prisma.company.findMany();
    for (const company of companies) {
        console.log(`\n🏢 ${company.name}`);
        const cuentas = [
            { code: 'efectivo_mxn', name: 'Efectivo MXN', type: 'EFECTIVO', currency: 'MXN' },
            { code: 'efectivo_usd', name: 'Efectivo USD', type: 'EFECTIVO', currency: 'USD' },
            { code: 'banco1_mxn', name: 'Banco 1 MXN', type: 'BANCO', currency: 'MXN' },
            { code: 'banco1_usd', name: 'Banco 1 USD', type: 'BANCO', currency: 'USD' },
            { code: 'banco2_mxn', name: 'Banco 2 MXN', type: 'BANCO', currency: 'MXN' },
            { code: 'banco2_usd', name: 'Banco 2 USD', type: 'BANCO', currency: 'USD' },
            { code: 'banco3_mxn', name: 'Banco 3 MXN', type: 'BANCO', currency: 'MXN' },
            { code: 'banco3_usd', name: 'Banco 3 USD', type: 'BANCO', currency: 'USD' },
            { code: 'mercado_pago', name: 'Mercado Pago', type: 'PLATAFORMA', currency: 'MXN' },
            { code: 'caja_chica', name: 'Caja chica', type: 'CAJA_CHICA', currency: 'MXN' },
        ];
        for (const cuenta of cuentas) {
            const exists = await prisma.cashAccount.findUnique({
                where: { companyId_code: { companyId: company.id, code: cuenta.code } }
            });
            if (!exists) {
                await prisma.cashAccount.create({
                    data: {
                        companyId: company.id,
                        code: cuenta.code,
                        name: cuenta.name,
                        type: cuenta.type,
                        currency: cuenta.currency,
                        isActive: true,
                    }
                });
                console.log(`  ✅ ${cuenta.name}`);
            }
            else {
                console.log(`  ⏭ ${cuenta.name} ya existe`);
            }
        }
    }
    console.log('\n🎉 Cuentas creadas!');
}
main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-cuentas.js.map