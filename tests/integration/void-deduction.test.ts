import { beforeEach, describe, it, expect, vi } from 'vitest';
import { mockEmailTransport, sentEmails, clearSentEmails } from './helpers/email-mock';
mockEmailTransport();

import { truncateAll, createUser, createCouple, db, deductions } from './helpers/db';
import { voidDeductionAction } from '@/lib/server-actions/void-deduction';
import { todayInTz, daysAgo } from '@/lib/date';
import * as session from '@/lib/auth/require-session';
import { eq } from 'drizzle-orm';

async function makeDeduction(opts: { fromId: string; toId: string; coupleId: string; date?: string; points?: number; voided?: boolean }) {
  const today = opts.date ?? todayInTz('Asia/Shanghai');
  const [row] = await db.insert(deductions).values({
    coupleId: opts.coupleId, fromUserId: opts.fromId, toUserId: opts.toId,
    points: opts.points ?? 10, reason: 'x', occurredLocalDate: today,
    voidedAt: opts.voided ? new Date() : null
  }).returning();
  return row;
}

describe('voidDeductionAction', () => {
  beforeEach(async () => { await truncateAll(); clearSentEmails(); vi.restoreAllMocks(); });

  it('marks voided + sends email', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id, email: 'b@t.local' });
    const d = await makeDeduction({ fromId: A.id, toId: B.id, coupleId: c.id });

    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await voidDeductionAction({ id: d.id });
    expect(r).toEqual({ ok: true });

    const [row] = await db.select().from(deductions).where(eq(deductions.id, d.id));
    expect(row.voidedAt).not.toBeNull();
    expect(sentEmails[0].subject).toContain('撤销');
  });

  it('rejects when not the from_user', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id, email: 'b@t.local' });
    const d = await makeDeduction({ fromId: A.id, toId: B.id, coupleId: c.id });
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: B.id, email: B.email, name: B.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await voidDeductionAction({ id: d.id });
    expect(r).toEqual({ error: 'FORBIDDEN_VOID' });
  });

  it('rejects when not today (deductee tz)', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id, email: 'b@t.local' });
    const yesterday = daysAgo(todayInTz('Asia/Shanghai'), 1);
    const d = await makeDeduction({ fromId: A.id, toId: B.id, coupleId: c.id, date: yesterday });
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await voidDeductionAction({ id: d.id });
    expect(r).toEqual({ error: 'FORBIDDEN_VOID' });
  });

  it('rejects already voided', async () => {
    const c = await createCouple();
    const A = await createUser({ coupleId: c.id });
    const B = await createUser({ coupleId: c.id, email: 'b@t.local' });
    const d = await makeDeduction({ fromId: A.id, toId: B.id, coupleId: c.id, voided: true });
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await voidDeductionAction({ id: d.id });
    expect(r).toEqual({ error: 'FORBIDDEN_VOID' });
  });
});
