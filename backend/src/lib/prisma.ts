import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance shared across the entire backend.
 * Using a single instance prevents connection pool exhaustion and ensures
 * all modules share the same database connection lifecycle.
 */
const prisma = new PrismaClient();

export default prisma;
