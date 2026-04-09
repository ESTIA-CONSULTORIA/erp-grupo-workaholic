"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function toCode(str) {
    return str.toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 50);
}
async function main() {
    console.log('📊 Cargando catálogo de cuentas...');
    const companies = await prisma.company.findMany();
    if (!companies.length)
        throw new Error('No hay empresas');
    const catalogo = [
        {
            section: 'GASTOS_GENERALES', sectionName: 'Gastos Generales', order: 1,
            grupos: [
                { name: 'Trámites / Gestiones', rubrics: ['Alcoholes', 'Multas', 'Permisos', 'Oficina Contador', 'Gestiones'] },
                { name: 'Renta', rubrics: ['Edificio', 'Estacionamiento'] },
                { name: 'Aseo y Limpieza', rubrics: ['Art. Limpieza', 'Basura', 'Fumigación', 'Skit Industrial'] },
                { name: 'Comedor de Empleados', rubrics: ['Comedor', 'Cumpleaños'] },
                { name: 'Comisiones Bancarias', rubrics: ['Banregio', 'Playtomic', 'Mercado Pago'] },
                { name: 'Comisiones Ventas / Bonos', rubrics: ['Comisiones ventas', 'Bonos'] },
                { name: 'Servicios', rubrics: ['CESPM', 'CFE', 'Morvil Paneles'] },
                { name: 'Mtto Audio Ilum Cómputo', rubrics: ['Audio', 'Iluminación', 'Equipo Cómputo'] },
                { name: 'Mtto Edificio Mobiliario', rubrics: ['Mantenimiento edificio', 'Herramientas', 'Eq restaurant', 'Eq deportivo', 'Mobiliario club', 'Eq oficina'] },
                { name: 'Mtto Transporte', rubrics: ['Mantenimiento transporte', 'Gasolina'] },
                { name: 'Papelería', rubrics: ['Impresora', 'Art Oficina'] },
                { name: 'Comercial', rubrics: ['Marketing', 'Deterioro M Promocional', 'INDEX'] },
                { name: 'Gasto Administrativo', rubrics: ['Gasto administrativo general'] },
                { name: 'Nóminas Operación', rubrics: ['Gerencia', 'Servicio', 'Recepción', 'Club', 'Coach', 'Cocina', 'Barra', 'Finiquitos', 'Vacaciones', 'Prorrateo aguinaldo'] },
                { name: 'Servicios Digitales', rubrics: ['CRM', 'SoftRestaurant', 'Kaelus', 'Alarma', 'Sky', 'ChatGPT', 'Spotify', 'Joycard', 'Capcut', 'Mem Playtomic', 'R Sis ContPAQ', 'Internet'] },
                { name: 'Gastos de Operación', rubrics: ['Uniformes', 'Capacitación Personal', 'Gasto evento', 'Gastos evento manteles'] },
                { name: 'Otros Gastos', rubrics: ['Donación', 'Otros'] },
            ]
        },
        {
            section: 'CONTRIBUCIONES', sectionName: 'Contribuciones', order: 2,
            grupos: [
                { name: 'Contribuciones', rubrics: ['IMSS Patronal', 'Infonavit', 'REPSE', 'Impuestos Federales', 'Impuestos Trimestrales'] }
            ]
        }
    ];
    for (const company of companies) {
        console.log(`\n🏢 ${company.name}`);
        let schema = await prisma.financialSchema.findUnique({ where: { companyId: company.id } });
        if (!schema) {
            schema = await prisma.financialSchema.create({
                data: { companyId: company.id, name: `Esquema ${company.name}`, isActive: true }
            });
        }
        for (const sec of catalogo) {
            let section = await prisma.financialSection.findUnique({
                where: { schemaId_code: { schemaId: schema.id, code: sec.section } }
            });
            if (!section) {
                section = await prisma.financialSection.create({
                    data: { schemaId: schema.id, code: sec.section, name: sec.sectionName, order: sec.order }
                });
            }
            let groupOrder = 1;
            for (const grp of sec.grupos) {
                const grpCode = toCode(grp.name);
                let group = await prisma.financialGroup.findUnique({
                    where: { sectionId_code: { sectionId: section.id, code: grpCode } }
                });
                if (!group) {
                    group = await prisma.financialGroup.create({
                        data: { sectionId: section.id, code: grpCode, name: grp.name, order: groupOrder }
                    });
                }
                groupOrder++;
                let rubricOrder = 1;
                for (const rub of grp.rubrics) {
                    const rubCode = toCode(rub);
                    const exists = await prisma.financialRubric.findUnique({
                        where: { groupId_code: { groupId: group.id, code: rubCode } }
                    });
                    if (!exists) {
                        await prisma.financialRubric.create({
                            data: {
                                groupId: group.id,
                                code: rubCode,
                                name: rub,
                                order: rubricOrder,
                                rubricType: 'GASTO',
                            }
                        });
                    }
                    rubricOrder++;
                }
                console.log(`  ✅ ${grp.name}`);
            }
        }
    }
    console.log('\n🎉 Catálogo cargado!');
}
main()
    .catch(e => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-catalogo.js.map