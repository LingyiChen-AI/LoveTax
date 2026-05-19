import { beforeEach, describe, it, expect, vi } from 'vitest';
import { mockEmailTransport, sentEmails, clearSentEmails } from './helpers/email-mock';
mockEmailTransport();

import { truncateAll, createUser, createCouple, db, deductions } from './helpers/db';
import { eq } from 'drizzle-orm';
import { createBonusAction } from '@/lib/server-actions/create-bonus';
import * as session from '@/lib/auth/require-session';

async function pair() {
  const c = await createCouple();
  const A = await createUser({ coupleId: c.id, displayName: 'A', email: 'a@t.local' });
  const B = await createUser({ coupleId: c.id, displayName: 'B', email: 'b@t.local' });
  return { c, A, B };
}

describe('createBonusAction', () => {
  beforeEach(async () => { await truncateAll(); clearSentEmails(); vi.restoreAllMocks(); });

  it('inserts kind=bonus row + sends bonus email', async () => {
    const { c, A, B } = await pair();
    await db.insert(deductions).values({
      coupleId: c.id, fromUserId: A.id, toUserId: B.id, points: 20,
      reason: 'x', occurredLocalDate: new Date().toISOString().slice(0,10), kind: 'deduct'
    });
    await db.insert(deductions).values({
      coupleId: c.id, fromUserId: A.id, toUserId: B.id, points: 10,
      reason: 'x2', occurredLocalDate: new Date().toISOString().slice(0,10), kind: 'deduct'
    });
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const res = await createBonusAction({ points: 10, reason: '带了奶茶' });
    expect(res).toEqual({ ok: true, pointsApplied: 10, remaining: 80 });
    const rows = await db.select().from(deductions).where(eq(deductions.kind, 'bonus'));
    expect(rows).toHaveLength(1);
    expect(sentEmails[0].subject).toContain('+10');
    expect(sentEmails[0].subject).toContain('夸了你');
  });

  it('returns BONUS_FULL when partner already at 100', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await createBonusAction({ points: 5, reason: 'x' });
    expect(r).toEqual({ error: 'BONUS_FULL' });
  });

  it('caps mid-way: submit 20 with deficit 8 → records 8', async () => {
    const { c, A, B } = await pair();
    await db.insert(deductions).values({
      coupleId: c.id, fromUserId: A.id, toUserId: B.id, points: 8,
      reason: 'x', occurredLocalDate: new Date().toISOString().slice(0,10), kind: 'deduct'
    });
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await createBonusAction({ points: 20, reason: 'cap me' });
    expect(r).toEqual({ ok: true, pointsApplied: 8, remaining: 100 });
  });

  it('rejects INVALID_POINTS', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    expect(await createBonusAction({ points: 0, reason: 'x' })).toEqual({ error: 'INVALID_POINTS' });
    expect(await createBonusAction({ points: 21, reason: 'x' })).toEqual({ error: 'INVALID_POINTS' });
  });

  it('rejects INVALID_REASON empty', async () => {
    const { c, A } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    const r = await createBonusAction({ points: 10, reason: '' });
    expect(r).toEqual({ error: 'INVALID_REASON' });
  });

  it('remaining correct after deduct + bonus chain', async () => {
    const { c, A, B } = await pair();
    vi.spyOn(session, 'requirePaired').mockResolvedValue({ id: A.id, email: A.email, name: A.displayName, role: 'user', coupleId: c.id, mustChangePassword: false });
    await db.insert(deductions).values([
      { coupleId: c.id, fromUserId: A.id, toUserId: B.id, points: 20, reason: 'x', occurredLocalDate: new Date().toISOString().slice(0,10), kind: 'deduct' },
      { coupleId: c.id, fromUserId: A.id, toUserId: B.id, points: 10, reason: 'x2', occurredLocalDate: new Date().toISOString().slice(0,10), kind: 'deduct' }
    ]);
    const r = await createBonusAction({ points: 15, reason: 'sorry' });
    expect(r).toEqual({ ok: true, pointsApplied: 15, remaining: 85 });
  });
});
