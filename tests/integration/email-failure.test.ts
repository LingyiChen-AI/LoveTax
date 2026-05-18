import { beforeEach, describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/email/transport', () => ({
  getTransport: () => ({
    sendMail: async () => { throw new Error('SMTP DOWN'); }
  }),
  emailFrom: () => 'test@local'
}));

import { truncateAll, createUser, createCouple, db, deductions, emailLog } from './helpers/db';
import { createDeductionAction } from '@/lib/server-actions/create-deduction';
import * as session from '@/lib/auth/require-session';

describe('email failure tolerance', () => {
  beforeEach(async () => { await truncateAll(); vi.restoreAllMocks(); });

  it('deduction still inserted, email_log records failure', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id, displayName: 'A' });
    const B = await createUser({ coupleId: c.id, displayName: 'B', email: 'b@t.local' });
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });

    const r = await createDeductionAction({ points: 10, reason: 'x' });
    expect(r).toEqual({ ok: true, pointsApplied: 10, remaining: 90 });

    const rows = await db.select().from(deductions);
    expect(rows).toHaveLength(1);

    // Email is fire-and-forget; poll until email_log row appears (max ~2s)
    let logs: typeof emailLog.$inferSelect[] = [];
    for (let i = 0; i < 20; i++) {
      logs = await db.select().from(emailLog);
      if (logs.length > 0) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(logs).toHaveLength(1);
    expect(logs[0].status).toBe('failed');
    expect(logs[0].error).toContain('SMTP DOWN');
    expect(logs[0].attempts).toBe(3);
  }, 60_000);
});
