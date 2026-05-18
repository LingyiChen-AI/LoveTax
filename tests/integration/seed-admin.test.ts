import { beforeEach, describe, it, expect } from 'vitest';
import { truncateAll, db, users } from './helpers/db';
import { execa } from 'execa';
import { eq } from 'drizzle-orm';

describe('seed-admin script', () => {
  beforeEach(async () => { await truncateAll(); });

  it('creates an admin when none exists', async () => {
    const env = { ...process.env, SEED_ADMIN_EMAIL: 'seed@t.local', SEED_ADMIN_PASSWORD: 'Seed123!Seed' };
    await execa('npx', ['tsx', 'scripts/seed-admin.ts'], { env });
    const [a] = await db.select().from(users).where(eq(users.role, 'admin'));
    expect(a.email).toBe('seed@t.local');
  });

  it('is idempotent — does not create a second admin', async () => {
    const env = { ...process.env, SEED_ADMIN_EMAIL: 'seed@t.local', SEED_ADMIN_PASSWORD: 'Seed123!Seed' };
    await execa('npx', ['tsx', 'scripts/seed-admin.ts'], { env });
    await execa('npx', ['tsx', 'scripts/seed-admin.ts'], { env });
    const all = await db.select().from(users).where(eq(users.role, 'admin'));
    expect(all).toHaveLength(1);
  });
});
