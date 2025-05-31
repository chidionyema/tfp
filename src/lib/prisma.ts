// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Re-use the same PrismaClient across hot-reloads in dev.
// In prod the file is loaded exactly once, so the global hack is a no-op.
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],          // add 'query' in local dev if you like
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
