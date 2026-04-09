"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const user = await prisma.user.update({
        where: { email: 'carolina@grupoworkaholic.com' },
        data: { pin: '9632' },
    });
    console.log('✅ PIN configurado para:', user.name);
}
main()
    .catch(e => console.error('❌ Error:', e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=set-pin.js.map