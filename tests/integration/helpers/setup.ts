import { beforeAll, vi } from 'vitest';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

process.env.DATABASE_URL ??= 'postgres://lovetax:lovetax@localhost:5433/lovetax_test';
process.env.AUTH_SECRET ??= 'test-secret-test-secret-test-secret';
process.env.SMTP_HOST ??= 'localhost';
process.env.SMTP_PORT ??= '1026';
process.env.SMTP_FROM ??= 'LoveTax <no-reply@test.local>';
process.env.APP_URL ??= 'http://localhost:30001';

// Stub Next.js server-side APIs that require a request context
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn)
}));

beforeAll(async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  await migrate(drizzle(sql), { migrationsFolder: './lib/db/migrations' });
  await sql.end();
});
