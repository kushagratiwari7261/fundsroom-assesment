import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.challan.findUnique({
    where: { challanNumber: 'CHL-2026-0002' },
    include: { items: true, user: true }
  });
  console.log(JSON.stringify(c, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
