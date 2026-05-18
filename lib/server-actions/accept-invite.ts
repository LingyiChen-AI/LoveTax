'use server';

import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { invitations, users, couples } from '@/lib/db/schema';
import { acceptInviteSchema } from '@/lib/validation/schemas';
import { requireUser } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';

export async function acceptInviteAction(token: string): Promise<{ ok: true; coupleId: string } | { error: string }> {
  const me = await requireUser();
  if (me.coupleId) return { error: 'ALREADY_PAIRED' };

  const parsed = acceptInviteSchema.safeParse({ token });
  if (!parsed.success) return { error: 'INVITE_INVALID' };

  return await db.transaction(async (tx) => {
    const [inv] = await tx.select().from(invitations).where(eq(invitations.token, token)).limit(1);
    if (!inv) return { error: 'INVITE_INVALID' };
    if (inv.status !== 'pending') return { error: 'INVITE_INVALID' };
    if (inv.expiresAt < new Date()) {
      await tx.update(invitations).set({ status: 'expired' }).where(eq(invitations.id, inv.id));
      return { error: 'INVITE_INVALID' };
    }
    if (inv.inviterUserId === me.id) return { error: 'INVITE_INVALID' };

    // Make sure invitee email matches the accepter (loose: case-insensitive)
    if (inv.inviteeEmail.toLowerCase() !== me.email.toLowerCase()) {
      return { error: 'INVITE_INVALID' };
    }

    // Fetch inviter; ensure they're not paired already
    const [inviter] = await tx.select().from(users).where(eq(users.id, inv.inviterUserId)).limit(1);
    if (!inviter) return { error: 'INVITE_INVALID' };
    if (inviter.coupleId) return { error: 'INVITE_INVALID' };

    const [couple] = await tx.insert(couples).values({}).returning();
    await tx.update(users).set({ coupleId: couple.id, updatedAt: new Date() })
      .where(and(eq(users.id, inv.inviterUserId)));
    await tx.update(users).set({ coupleId: couple.id, updatedAt: new Date() })
      .where(and(eq(users.id, me.id)));
    await tx.update(invitations).set({ status: 'accepted', acceptedAt: new Date() })
      .where(eq(invitations.id, inv.id));

    revalidatePath('/onboarding');
    revalidatePath('/home');
    return { ok: true, coupleId: couple.id };
  });
}
