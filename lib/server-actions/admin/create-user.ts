'use server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { adminCreateUserSchema } from '@/lib/validation/schemas';
import { requireAdmin } from '@/lib/auth/require-session';
import { revalidatePath } from 'next/cache';

export async function adminCreateUser(formData: FormData): Promise<{ ok: true } | { error: string }> {
  await requireAdmin();
  const parsed = adminCreateUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    role: formData.get('role') ?? 'user'
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'INVALID_INPUT' };
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, parsed.data.email)).limit(1);
  if (existing.length) return { error: 'CONFLICT' };
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db.insert(users).values({
    email: parsed.data.email,
    passwordHash,
    displayName: parsed.data.displayName,
    role: parsed.data.role
  });
  revalidatePath('/admin/users');
  return { ok: true };
}
