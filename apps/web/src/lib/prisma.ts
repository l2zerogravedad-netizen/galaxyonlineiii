// Re-exportar prisma desde @galaxy/database para evitar múltiples instancias
export { prisma } from '@galaxy/database';
export { Prisma } from '@galaxy/database';

// Tipo del cliente transaccional ($transaction callback param).
// Tiparlo explícitamente evita "implicitly has an 'any' type" en builds donde
// el cliente Prisma generado tipa el callback de forma más estricta (p.ej. Railway/Linux).
import type { Prisma as PrismaNS } from '@galaxy/database';
export type Tx = PrismaNS.TransactionClient;
