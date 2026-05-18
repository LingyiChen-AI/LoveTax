'use server';

import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { registerSchema } from '@/lib/validation/schemas';
import { signIn } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { redirect } from 'next/navigation';

export type RegisterState = { error?: string } | null;

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    inviteToken: formData.get('inviteToken') || undefined
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'INVALID_INPUT' };
  }
  const { email, password, displayName, inviteToken } = parsed.data;

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: 'CONFLICT' };

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({ email, passwordHash, displayName, role: 'user' });

  // Sign in via Credentials (NextAuth will set the cookie)
  await signIn('credentials', { email, password, redirect: false });

  if (inviteToken) {
    redirect(`/invite/${inviteToken}`);
  }
  redirect('/onboarding');
}
