import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from './index';
import { AppError } from '@/lib/errors';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  coupleId: string | null;
  mustChangePassword: boolean;
};

async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const sessUser = session.user as any;
  // Re-read from DB so coupleId/role/mustChangePassword reflect latest state
  // This eliminates JWT staleness after pairing, password reset, etc.
  const [row] = await db.select().from(users).where(eq(users.id, sessUser.id)).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.displayName,
    role: row.role,
    coupleId: row.coupleId ?? null,
    mustChangePassword: row.mustChangePassword
  };
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect('/login');
  if (u.mustChangePassword) redirect('/change-password');
  return u;
}

export async function requirePaired(): Promise<SessionUser & { coupleId: string }> {
  const u = await requireUser();
  if (!u.coupleId) redirect('/onboarding');
  return u as SessionUser & { coupleId: string };
}

export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== 'admin') throw new AppError('FORBIDDEN');
  return u;
}

export async function getOptionalUser(): Promise<SessionUser | null> {
  return getSessionUser();
}
