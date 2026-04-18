import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const result = await prisma.mealLog.findMany({
    orderBy: { date: 'desc' },
    take: 5
  });
  console.log("RECENT MEALS:");
  console.dir(result, { depth: null });
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
