const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const meals = await prisma.mealLog.findMany({ orderBy: { id: 'desc' }, take: 5 });
  console.log(meals);
}
run();
