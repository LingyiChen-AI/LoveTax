import { beforeEach, describe, it, expect } from 'vitest';
import { mockEmailTransport, sentEmails, clearSentEmails } from './helpers/email-mock';
mockEmailTransport();

import { truncateAll, createUser, createCouple, db, invitations } from './helpers/db';
import { eq, sql } from 'drizzle-orm';
import { inviteUserAction } from '@/lib/server-actions/invite-user';
import { acceptInviteAction } from '@/lib/server-actions/accept-invite';
import { generateInviteToken } from '@/lib/invite-token';
import { users as usersT } from '@/lib/db/schema';

// Stub session
import * as session from '@/lib/auth/require-session';
import { vi } from 'vitest';

describe('inviteUserAction', () => {
  beforeEach(async () => { await truncateAll(); clearSentEmails(); vi.restoreAllMocks(); });

  it('creates an invitation and sends an email', async () => {
    const u = await createUser({ displayName: 'A' });
    vi.spyOn(session, 'requireUser').mockResolvedValue({
      id: u.id, email: u.email, name: u.displayName, role: 'user', coupleId: null, mustChangePassword: false
    });
    const fd = new FormData();
    fd.set('inviteeEmail', 'partner@t.local');
    const res = await inviteUserAction(fd);
    expect(res).toEqual({ ok: true });

    const [row] = await db.select().from(invitations).where(eq(invitations.inviterUserId, u.id));
    expect(row.status).toBe('pending');
    expect(row.inviteeEmail).toBe('partner@t.local');
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].subject).toContain('邀请你加入');
  });

  it('reuses existing pending invite', async () => {
    const u = await createUser();
    vi.spyOn(session, 'requireUser').mockResolvedValue({ id: u.id, email: u.email, name: u.displayName, role: 'user', coupleId: null, mustChangePassword: false });
    const fd = new FormData();
    fd.set('inviteeEmail', 'p@t.local');
    await inviteUserAction(fd);
    await inviteUserAction(fd);
    const rows = await db.select().from(invitations);
    expect(rows).toHaveLength(1);
  });

  it('rejects when already paired', async () => {
    const couple = await createCouple();
    const u = await createUser({ coupleId: couple.id });
    vi.spyOn(session, 'requireUser').mockResolvedValue({ id: u.id, email: u.email, name: u.displayName, role: 'user', coupleId: couple.id, mustChangePassword: false });
    const fd = new FormData();
    fd.set('inviteeEmail', 'p@t.local');
    const res = await inviteUserAction(fd);
    expect(res).toEqual({ error: 'CONFLICT' });
  });

  it('rejects invalid email', async () => {
    const u = await createUser();
    vi.spyOn(session, 'requireUser').mockResolvedValue({ id: u.id, email: u.email, name: u.displayName, role: 'user', coupleId: null, mustChangePassword: false });
    const fd = new FormData();
    fd.set('inviteeEmail', 'not-email');
    const res = await inviteUserAction(fd);
    expect(res).toEqual({ error: 'INVALID_EMAIL' });
  });
});

describe('acceptInviteAction', () => {
  beforeEach(async () => { await truncateAll(); vi.restoreAllMocks(); });

  it('pairs both users on accept', async () => {
    const A = await createUser({ email: 'a@t.local', displayName: 'A' });
    const B = await createUser({ email: 'b@t.local', displayName: 'B' });
    const token = generateInviteToken();
    await db.insert(invitations).values({
      inviterUserId: A.id, inviteeEmail: 'b@t.local', token,
      status: 'pending', expiresAt: new Date(Date.now() + 86400_000)
    });
    vi.spyOn(session, 'requireUser').mockResolvedValue({
      id: B.id, email: B.email, name: B.displayName, role: 'user', coupleId: null, mustChangePassword: false
    });
    const res = await acceptInviteAction(token);
    expect('ok' in res && res.ok).toBe(true);

    const [a2] = await db.select().from(usersT).where(sql`id=${A.id}`);
    const [b2] = await db.select().from(usersT).where(sql`id=${B.id}`);
    expect(a2.coupleId).toBeTruthy();
    expect(a2.coupleId).toBe(b2.coupleId);
    const [inv] = await db.select().from(invitations).where(sql`token=${token}`);
    expect(inv.status).toBe('accepted');
  });

  it('rejects expired invite', async () => {
    const A = await createUser({ email: 'a@t.local' });
    const B = await createUser({ email: 'b@t.local' });
    const token = generateInviteToken();
    await db.insert(invitations).values({
      inviterUserId: A.id, inviteeEmail: 'b@t.local', token,
      status: 'pending', expiresAt: new Date(Date.now() - 1000)
    });
    vi.spyOn(session, 'requireUser').mockResolvedValue({ id: B.id, email: B.email, name: B.displayName, role: 'user', coupleId: null, mustChangePassword: false });
    const res = await acceptInviteAction(token);
    expect(res).toEqual({ error: 'INVITE_INVALID' });
  });

  it('rejects email mismatch', async () => {
    const A = await createUser({ email: 'a@t.local' });
    const B = await createUser({ email: 'wrong@t.local' });
    const token = generateInviteToken();
    await db.insert(invitations).values({
      inviterUserId: A.id, inviteeEmail: 'b@t.local', token,
      status: 'pending', expiresAt: new Date(Date.now() + 86400_000)
    });
    vi.spyOn(session, 'requireUser').mockResolvedValue({ id: B.id, email: B.email, name: B.displayName, role: 'user', coupleId: null, mustChangePassword: false });
    const res = await acceptInviteAction(token);
    expect(res).toEqual({ error: 'INVITE_INVALID' });
  });

  it('rejects when accepter already paired', async () => {
    const couple = await createCouple();
    const A = await createUser({ email: 'a@t.local' });
    const B = await createUser({ email: 'b@t.local', coupleId: couple.id });
    const token = generateInviteToken();
    await db.insert(invitations).values({
      inviterUserId: A.id, inviteeEmail: 'b@t.local', token,
      status: 'pending', expiresAt: new Date(Date.now() + 86400_000)
    });
    vi.spyOn(session, 'requireUser').mockResolvedValue({ id: B.id, email: B.email, name: B.displayName, role: 'user', coupleId: couple.id, mustChangePassword: false });
    const res = await acceptInviteAction(token);
    expect(res).toEqual({ error: 'ALREADY_PAIRED' });
  });
});
