import { beforeEach, describe, it, expect } from 'vitest';
import { mockEmailTransport, sentEmails, clearSentEmails } from './helpers/email-mock';
mockEmailTransport();

import { truncateAll, createUser, createCouple, db, invitations } from './helpers/db';
import { eq } from 'drizzle-orm';
import { inviteUserAction } from '@/lib/server-actions/invite-user';

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
