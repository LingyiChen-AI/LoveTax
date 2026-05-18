'use server';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { changePasswordSchema } from '@/lib/validation/schemas';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export type CPState = { error?: string } | null;

export async function changePasswordAction(_prev: CPState, formData: FormData): Promise<CPState> {
  const session = await auth();
  const sUser: any = session?.user;
  if (!sUser?.id) return { error: 'UNAUTHORIZED' };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword') || undefined,
    newPassword: formData.get('newPassword')
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'INVALID_INPUT' };

  const [row] = await db.select().from(users).where(eq(users.id, sUser.id)).limit(1);
  if (!row) return { error: 'NOT_FOUND' };

  if (!row.mustChangePassword) {
    const ok = parsed.data.currentPassword
      ? await bcrypt.compare(parsed.data.currentPassword, row.passwordHash)
      : false;
    if (!ok) return { error: 'INVALID_CREDENTIALS' };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(users).set({ passwordHash: newHash, mustChangePassword: false, updatedAt: new Date() })
    .where(eq(users.id, sUser.id));

  redirect('/home');
}
