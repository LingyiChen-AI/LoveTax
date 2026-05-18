import { redirect } from 'next/navigation';
import { auth } from './index';
import { AppError } from '@/lib/errors';

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
  const u = session.user as any;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    coupleId: u.coupleId ?? null,
    mustChangePassword: !!u.mustChangePassword
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
