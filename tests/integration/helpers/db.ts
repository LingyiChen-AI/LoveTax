import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, couples, invitations, deductions, emailLog, rateLimits } from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

export async function truncateAll() {
  await db.execute(sql`TRUNCATE TABLE rate_limits, email_log, deductions, invitations, users, couples RESTART IDENTITY CASCADE`);
}

export async function createUser(opts: Partial<{ email: string; displayName: string; role: 'user'|'admin'; coupleId: string|null; timezone: string; mustChangePassword: boolean; password: string }> = {}) {
  const email = opts.email ?? `u-${Math.random().toString(36).slice(2, 8)}@t.local`;
  const passwordHash = await bcrypt.hash(opts.password ?? 'Password1', 4);
  const [u] = await db.insert(users).values({
    email, passwordHash,
    displayName: opts.displayName ?? 'Tester',
    role: opts.role ?? 'user',
    coupleId: opts.coupleId ?? null,
    timezone: opts.timezone ?? 'Asia/Shanghai',
    mustChangePassword: opts.mustChangePassword ?? false
  }).returning();
  return u;
}

export async function createCouple() {
  const [c] = await db.insert(couples).values({}).returning();
  return c;
}

export async function pairUsers(a: string, b: string) {
  const couple = await createCouple();
  await db.update(users).set({ coupleId: couple.id }).where(sql`id IN (${a}, ${b})`);
  return couple;
}

export { db, users, couples, invitations, deductions, emailLog, rateLimits };
