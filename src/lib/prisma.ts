let prisma: any = null;

try {
  // Dynamic import to prevent crash if @prisma/client hasn't been generated yet
  const { PrismaClient } = require('@prisma/client');
  
  const globalForPrisma = globalThis as unknown as {
    prisma: any | undefined;
  };

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ['warn', 'error'],
    });

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
} catch {
  // Prisma client not generated yet or DB not available
  console.warn('[ApexFit] Prisma client not available. Running in mock mode.');
  prisma = null;
}

export { prisma };
