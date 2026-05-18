import 'dotenv/config';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../lib/db/schema';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('[seed-admin] SEED_ADMIN_EMAIL/PASSWORD not set — skipping');
    return;
  }
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL missing');
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql, { schema: { users } });

  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin')).limit(1);
  if (admin) {
    console.log('[seed-admin] admin already exists — noop');
    await sql.end();
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({
    email,
    passwordHash,
    displayName: 'Admin',
    role: 'admin'
  });
  console.log(`[seed-admin] created admin ${email}`);
  await sql.end();
}

main().catch((e) => { console.error('[seed-admin]', e); process.exit(1); });
