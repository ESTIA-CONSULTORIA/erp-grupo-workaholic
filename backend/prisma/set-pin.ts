import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'carolina@grupoworkaholic.com' },
    data:  { pin: '9632' },
  });
  console.log('✅ PIN configurado para:', user.name);
}

main()
  .catch(e => console.error('❌ Error:', e))
  .finally(() => prisma.$disconnect());
