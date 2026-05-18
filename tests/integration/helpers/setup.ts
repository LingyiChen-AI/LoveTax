import { beforeAll } from 'vitest';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

process.env.DATABASE_URL ??= 'postgres://zchat:zchat@localhost:5433/zchat_test';
process.env.AUTH_SECRET ??= 'test-secret-test-secret-test-secret';
process.env.SMTP_HOST ??= 'localhost';
process.env.SMTP_PORT ??= '1026';
process.env.SMTP_FROM ??= 'zchat <no-reply@test.local>';
process.env.APP_URL ??= 'http://localhost:3000';

beforeAll(async () => {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  await migrate(drizzle(sql), { migrationsFolder: './lib/db/migrations' });
  await sql.end();
});
