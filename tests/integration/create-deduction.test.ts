import { beforeEach, describe, it, expect, vi } from 'vitest';
import { mockEmailTransport, sentEmails, clearSentEmails } from './helpers/email-mock';
mockEmailTransport();

import { truncateAll, createUser, createCouple, db, deductions } from './helpers/db';
import { createDeductionAction } from '@/lib/server-actions/create-deduction';
import * as session from '@/lib/auth/require-session';

async function pair() {
  const c = await createCouple();
  const A = await createUser({ coupleId: c.id, displayName: 'A', email: 'a@t.local' });
  const B = await createUser({ coupleId: c.id, displayName: 'B', email: 'b@t.local' });
  return { c, A, B };
}

describe('createDeductionAction', () => {
  beforeEach(async () => { await truncateAll(); clearSentEmails(); vi.restoreAllMocks(); });

  it('inserts row + sends email', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const res = await createDeductionAction({ points: 10, reason: '玩手机太久' });
    expect(res).toEqual({ ok: true, pointsApplied: 10, remaining: 90 });
    const rows = await db.select().from(deductions);
    expect(rows).toHaveLength(1);
    expect(sentEmails[0].subject).toContain('10');
  });

  it('returns BLOOD_EMPTY when remaining is 0', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    // Pre-fill 100 points (5 × 20)
    await createDeductionAction({ points: 20, reason: 'a' });
    await createDeductionAction({ points: 20, reason: 'b' });
    await createDeductionAction({ points: 20, reason: 'c' });
    await createDeductionAction({ points: 20, reason: 'd' });
    await createDeductionAction({ points: 20, reason: 'e' });
    // Remaining = 0; next should be BLOOD_EMPTY
    const r = await createDeductionAction({ points: 5, reason: 'over' });
    expect(r).toEqual({ error: 'BLOOD_EMPTY' });
  });

  it('caps mid-way: submit 20 when only 8 remaining → records 8', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    await createDeductionAction({ points: 20, reason: 'a' });
    await createDeductionAction({ points: 20, reason: 'b' });
    await createDeductionAction({ points: 20, reason: 'c' });
    await createDeductionAction({ points: 20, reason: 'd' });
    await createDeductionAction({ points: 12, reason: 'e' }); // remaining 8
    const r = await createDeductionAction({ points: 20, reason: 'cap me' });
    expect(r).toEqual({ ok: true, pointsApplied: 8, remaining: 0 });
  });

  it('rejects INVALID_POINTS', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    expect(await createDeductionAction({ points: 0, reason: 'x' })).toEqual({ error: 'INVALID_POINTS' });
    expect(await createDeductionAction({ points: 21, reason: 'x' })).toEqual({ error: 'INVALID_POINTS' });
  });

  it('rejects INVALID_REASON empty', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await createDeductionAction({ points: 10, reason: '' });
    expect(r).toEqual({ error: 'INVALID_REASON' });
  });
});
