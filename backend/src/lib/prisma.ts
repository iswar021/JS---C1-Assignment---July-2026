import { PrismaClient } from '@prisma/client';

/**
 * Single shared PrismaClient instance.
 * A module-level singleton avoids exhausting the DB connection pool during
 * development hot-reloads and in tests.
 */
export const prisma = new PrismaClient();
